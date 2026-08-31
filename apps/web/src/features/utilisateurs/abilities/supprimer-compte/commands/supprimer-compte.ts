import {
  type CompteASupprimer,
  estCourrielAnonymise,
  identiteAnonyme,
  mediateurDe,
  type UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import {
  AccesNonCoupe,
  type AuteurSuppression,
  autoriserSuppression,
  CauseTechnique,
  type ChargesEffacement,
  CompteIntrouvable,
  type CompteSupprime,
  constat,
  type Empreinte,
  motifDe,
  NomCharge,
  planEffacement,
  type ResultatCharge,
  type SupprimerCompteError,
  VolumeEfface,
} from '../domain'
import {
  compteASupprimer,
  couperAcces,
  journaliserConstat,
} from '../implementation/prisma'

const causeDe = (erreur: unknown): CauseTechnique =>
  CauseTechnique(
    (erreur instanceof Error ? erreur.message : String(erreur)).slice(0, 500) ||
      'Erreur sans message',
  )

/**
 * Une charge produit un volume, ou rejette. La conversion du rejet en résultat
 * se fait ici, une seule fois : les adaptateurs restent triviaux et n'ont pas à
 * connaître le vocabulaire du constat.
 */
const executerCharge = async (
  charge: NomCharge,
  effacer: () => Promise<number>,
): Promise<ResultatCharge> => {
  try {
    const volume = await effacer()
    return volume === 0
      ? { _tag: 'sansObjet', charge }
      : { _tag: 'effacee', charge, volume: VolumeEfface(volume) }
  } catch (erreur) {
    return { _tag: 'echouee', charge, cause: causeDe(erreur) }
  }
}

/**
 * Les charges qui visent indifféremment un médiateur ou un coordinateur
 * reçoivent les rattachements tels quels : le type dit déjà ce qui existe.
 * Seules celles qui exigent un médiateur gardent un repli, parce que l'extraire
 * de l'union rend un `MediateurId | null` que le plan seul ne suffit pas à
 * écarter aux yeux du compilateur.
 */
const effacements = (
  compte: CompteASupprimer,
  charges: ChargesEffacement,
): ReadonlyMap<NomCharge, () => Promise<number>> => {
  const mediateurId = mediateurDe(compte.rattachements)

  return new Map([
    [
      NomCharge('PortefeuilleBeneficiaires'),
      async () =>
        mediateurId === null
          ? 0
          : (await charges.anonymiserPortefeuille({ mediateurId })).anonymises,
    ],
    [
      NomCharge('EmpreinteRdv'),
      async () => {
        const bilan = await charges.effacerEmpreinteRdv({
          utilisateurId: compte.id,
        })
        return bilan.rdvsExpurges + bilan.usagersSupprimes
      },
    ],
    [
      NomCharge('NotesAccompagnements'),
      async () =>
        (
          await charges.effacerNotesDesAccompagnements({
            rattachements: compte.rattachements,
          })
        ).effacees,
    ],
    [
      NomCharge('AppartenancesEquipe'),
      async () => {
        const bilan = await charges.libererDesEquipes({
          rattachements: compte.rattachements,
        })
        return (
          bilan.invitationsSupprimees +
          bilan.appartenancesSupprimees +
          bilan.tagsTransferes +
          bilan.tagsSupprimes
        )
      },
    ],
    [
      NomCharge('LieuxActivite'),
      async () =>
        mediateurId === null
          ? 0
          : (await charges.retirerDesLieuxActivite({ mediateurId }))
              .rattachementsSupprimes,
    ],
    [
      NomCharge('PartageStatistiques'),
      async () =>
        (
          await charges.revoquerPartageStatistiques({
            rattachements: compte.rattachements,
          })
        ).partagesRevoques,
    ],
    [
      NomCharge('ListesDeDiffusion'),
      async () =>
        (
          await charges.retirerDesListesDeDiffusion({
            courriel: compte.courriel,
          })
        ).contactSupprime
          ? 1
          : 0,
    ],
  ])
}

/**
 * Effacement complet d'un compte.
 *
 * L'ordre est la seule chose que cette commande apporte, et il porte trois
 * décisions :
 *
 * Le noyau d'abord — sessions, jetons, identité — parce que couper l'accès
 * avant d'effacer empêche une session encore ouverte de recréer ce qu'on vient
 * d'effacer. S'il échoue, rien d'autre n'est tenté et l'état est inchangé.
 *
 * Les satellites ensuite, chacun atomique chez lui, chacun MONOTONE : une
 * interruption laisse un état plus effacé que le précédent, jamais incohérent.
 * C'est ce qui permet de ne pas les envelopper dans une transaction commune —
 * laquelle exigerait de faire transiter un client Prisma à travers sept ports et
 * de remonter l'infrastructure dans le domaine de six features.
 *
 * Le constat enfin, qui dit ce qui a abouti. Il est un axe SÉPARÉ du résultat :
 * la personne peut être correctement déconnectée et anonymisée pendant qu'une
 * charge distante a échoué. Confondre les deux ferait avaler l'un des deux.
 */
export const supprimerCompte = async ({
  command: { cible, auteur, maintenant },
  charges,
  empreinte,
}: {
  readonly command: {
    readonly cible: UtilisateurId
    readonly auteur: AuteurSuppression
    readonly maintenant: Date
  }
  readonly charges: ChargesEffacement
  readonly empreinte: Empreinte
}): Promise<Result<CompteSupprime, SupprimerCompteError>> => {
  const compte = await compteASupprimer(cible)

  if (compte === null) return failure(CompteIntrouvable(cible))

  const autorisation = autoriserSuppression(compte, auteur)

  if (!autorisation.success) return autorisation

  const identite = identiteAnonyme(empreinte(`${compte.id}-${compte.courriel}`))

  try {
    await couperAcces({
      utilisateurId: compte.id,
      identite,
      supprimeLe: maintenant,
      dejaAnonymise: estCourrielAnonymise(compte.courriel),
    })
  } catch (erreur) {
    return failure(AccesNonCoupe(compte.id, causeDe(erreur)))
  }

  const aEffacer = effacements(compte, charges)

  const resultats = await planEffacement(compte.rattachements).reduce<
    Promise<readonly ResultatCharge[]>
  >(
    async (precedents, charge) => [
      ...(await precedents),
      await executerCharge(charge, aEffacer.get(charge) ?? (async () => 0)),
    ],
    Promise.resolve([]),
  )

  const compteSupprime: CompteSupprime = {
    id: compte.id,
    motif: motifDe(auteur),
    supprimeLe: maintenant,
    constat: constat(resultats),
  }

  journaliserConstat(compteSupprime)

  return success(compteSupprime)
}
