import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { type CompteAExaminer, derniereActivite } from './compte-a-examiner'
import { type EtapeInactivite, etapeInactivite } from './etape-inactivite'
import type { AnonymiserLesComptesInactifsDependances } from './ports'

export type CompteExamine = {
  readonly utilisateurId: UtilisateurId
  readonly etape: EtapeInactivite['_tag']
} & (
  | { readonly issue: 'simule' | 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)

const agir = async (
  compte: CompteAExaminer,
  etape: EtapeInactivite,
  maintenant: Date,
  dependances: AnonymiserLesComptesInactifsDependances,
): Promise<void> => {
  if (etape._tag === 'aAvertir') {
    await dependances.avertirDeLaSuppression({
      courriel: compte.courriel,
      prenom: compte.prenom,
      dateDeSuppression: etape.dateDeSuppression,
    })
    await dependances.noterLAvertissement(compte.id, maintenant)
    return
  }

  if (etape._tag === 'aSupprimer') {
    await dependances.supprimerLeCompte(compte.id)
  }
}

const examiner =
  (
    maintenant: Date,
    simuler: boolean,
    dependances: AnonymiserLesComptesInactifsDependances,
  ) =>
  async (compte: CompteAExaminer): Promise<CompteExamine> => {
    const etape = etapeInactivite({
      derniereActivite: derniereActivite(compte),
      avertiLe: compte.avertiLe,
      maintenant,
    })

    if (simuler) {
      return { utilisateurId: compte.id, etape: etape._tag, issue: 'simule' }
    }

    return agir(compte, etape, maintenant, dependances).then(
      (): CompteExamine => ({
        utilisateurId: compte.id,
        etape: etape._tag,
        issue: 'fait',
      }),
      (erreur: unknown): CompteExamine => ({
        utilisateurId: compte.id,
        etape: etape._tag,
        issue: 'echec',
        cause: erreur instanceof Error ? erreur.message : String(erreur),
      }),
    )
  }

export const anonymiserLesComptesInactifs =
  (dependances: AnonymiserLesComptesInactifsDependances) =>
  async ({
    maintenant,
    simuler,
  }: {
    readonly maintenant: Date
    readonly simuler: boolean
  }): Promise<readonly CompteExamine[]> => {
    const comptes = await dependances.lireLesComptesAExaminer(maintenant)

    return comptes.reduce<Promise<readonly CompteExamine[]>>(
      async (precedents, compte) => [
        ...(await precedents),
        await examiner(maintenant, simuler, dependances)(compte),
      ],
      Promise.resolve([]),
    )
  }
