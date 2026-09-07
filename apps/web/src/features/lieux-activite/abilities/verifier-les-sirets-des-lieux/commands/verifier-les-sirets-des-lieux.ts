import type {
  Compte,
  EffacerLeSiret,
  InterrogerSirene,
  Journal,
  LieuAVerifier,
  LireLesLieuxASiret,
  MarquerLeSiretVerifie,
  Verdict,
} from '../domain'
import { aucunExamen, compter, dejaVerifie, verdictDuSiret } from '../domain'

const PAS_DU_JOURNAL = 50

export type PortsDeVerification = {
  readonly lireLesLieuxASiret: LireLesLieuxASiret
  readonly interrogerSirene: InterrogerSirene
  readonly effacerLeSiret: EffacerLeSiret
  readonly marquerLeSiretVerifie: MarquerLeSiretVerifie
  readonly journal: Journal
}

/**
 * L'examen d'un lieu : ce qu'on décide de son SIRET, et ce qu'on en fait.
 *
 * Le verdict et l'écriture qui s'ensuit sont indissociables — « vérifié » date
 * la confrontation, « effacé » retire le numéro —, d'où la table qui les
 * apparie. Une erreur d'annuaire n'interrompt pas la passe : elle se journalise
 * et le lieu ressort inexaminé.
 */
const examinerLeLieu =
  (
    {
      interrogerSirene,
      effacerLeSiret,
      marquerLeSiretVerifie,
      journal,
    }: PortsDeVerification,
    verifiesDepuis: Date,
  ) =>
  async (lieu: LieuAVerifier): Promise<Verdict> => {
    if (dejaVerifie(lieu, verifiesDepuis)) return 'ignore'

    const application: Record<
      'verifie' | 'efface',
      (lieu: LieuAVerifier) => Promise<void>
    > = { verifie: marquerLeSiretVerifie, efface: effacerLeSiret }

    try {
      const verdict = verdictDuSiret(lieu, await interrogerSirene(lieu.siret))
      await application[verdict](lieu)

      return verdict
    } catch (error) {
      journal(
        `lieu ${lieu.id} : ${error instanceof Error ? error.message : 'erreur inconnue'}`,
      )

      return 'echec'
    }
  }

/**
 * De quoi suivre une passe d'une demi-heure sans la noyer : un point tous les
 * cinquante lieux.
 */
const avancement =
  (journal: Journal, total: number) =>
  (rang: number): void => {
    if (rang > 0 && rang % PAS_DU_JOURNAL === 0)
      journal(`${rang}/${total} lieux examinés`)
  }

/**
 * Confronte à SIRENE les SIRET que portent les lieux, et efface ceux qui
 * désignent un autre établissement.
 *
 * La coop ne possède pas ces numéros : ils viennent d'imports, de saisies, de
 * la cartographie. Un SIRET faux se propage — c'est lui qui sert de pivot dans
 * le schéma national — alors qu'un SIRET absent ne dit rien de faux. D'où le
 * sens unique de cette passe : elle vérifie et elle retire, elle ne complète
 * jamais, et elle ne touche ni au nom ni à l'adresse du lieu.
 *
 * L'écriture passe par des ports plutôt que par un drapeau : une passe à blanc
 * est la même vérification menée avec des ports qui n'écrivent pas.
 */
export const verifierLesSiretsDesLieux = async ({
  command: { verifiesDepuis },
  ports,
}: {
  readonly command: {
    /** Un lieu confronté à SIRENE après cette date est laissé de côté. */
    readonly verifiesDepuis: Date
  }
  readonly ports: PortsDeVerification
}): Promise<Compte> => {
  const lieux = await ports.lireLesLieuxASiret()

  ports.journal(`${lieux.length} lieux portent un SIRET`)

  const examiner = examinerLeLieu(ports, verifiesDepuis)
  const signaler = avancement(ports.journal, lieux.length)

  // Les lieux défilent un à un : chaque examen consomme un appel à l'annuaire
  // des entreprises, qui n'accepte pas la salve. Attendre l'accumulateur avant
  // d'appeler `examiner` est ce qui met les examens à la file — le second ne
  // démarre qu'une fois le premier reversé au compte.
  return lieux.reduce<Promise<Compte>>(async (compte, lieu, rang) => {
    const acquis = await compte

    signaler(rang)

    return compter(acquis, await examiner(lieu))
  }, Promise.resolve(aucunExamen))
}
