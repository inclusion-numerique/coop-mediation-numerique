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
  CompteIntrouvable,
  type CompteSupprime,
  EffacementStep,
  ErasedCount,
  effacementPlan,
  FailureReason,
  motifDe,
  report,
  type StepResult,
  type SupprimerCompteError,
  type SupprimerComptePorts,
} from '../domain'
import {
  compteASupprimer,
  couperAcces,
  logEffacementReport,
} from '../implementation/prisma'

const failureReasonOf = (erreur: unknown): FailureReason =>
  FailureReason(
    (erreur instanceof Error ? erreur.message : String(erreur)).slice(0, 500) ||
      'Erreur sans message',
  )

/**
 * Une étape produit un nombre, ou rejette. La conversion du rejet en résultat
 * se fait ici, une seule fois : les adaptateurs restent triviaux et n'ont pas à
 * connaître le vocabulaire du constat.
 */
const runStep = async (
  step: EffacementStep,
  effacer: () => Promise<number>,
): Promise<StepResult> => {
  try {
    const count = await effacer()
    return count === 0
      ? { _tag: 'skipped', step }
      : { _tag: 'erased', step, count: ErasedCount(count) }
  } catch (erreur) {
    return { _tag: 'failed', step, cause: failureReasonOf(erreur) }
  }
}

/**
 * Les étapes qui visent indifféremment un médiateur ou un coordinateur
 * reçoivent les rattachements tels quels : le type dit déjà ce qui existe.
 * Seules celles qui exigent un médiateur gardent un repli, parce que l'extraire
 * de l'union rend un `MediateurId | null` que le plan seul ne suffit pas à
 * écarter aux yeux du compilateur.
 */
const stepRunners = (
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
): ReadonlyMap<EffacementStep, () => Promise<number>> => {
  const mediateurId = mediateurDe(compte.rattachements)

  return new Map([
    [
      EffacementStep('PortefeuilleBeneficiaires'),
      async () =>
        mediateurId === null
          ? 0
          : (await ports.anonymiserPortefeuille({ mediateurId })).anonymises,
    ],
    [
      EffacementStep('EmpreinteRdv'),
      async () => {
        const outcome = await ports.effacerEmpreinteRdv({
          utilisateurId: compte.id,
        })
        return outcome.rdvsExpurges + outcome.usagersSupprimes
      },
    ],
    [
      EffacementStep('NotesAccompagnements'),
      async () =>
        (
          await ports.effacerNotes({
            rattachements: compte.rattachements,
          })
        ).effacees,
    ],
    [
      EffacementStep('AppartenancesEquipe'),
      async () => {
        const outcome = await ports.libererDesEquipes({
          rattachements: compte.rattachements,
        })
        return (
          outcome.invitationsSupprimees +
          outcome.appartenancesSupprimees +
          outcome.tagsTransferes +
          outcome.tagsSupprimes
        )
      },
    ],
    [
      EffacementStep('LieuxActivite'),
      async () =>
        mediateurId === null
          ? 0
          : (await ports.retirerDesLieux({ mediateurId }))
              .rattachementsSupprimes,
    ],
    [
      EffacementStep('PartageStatistiques'),
      async () =>
        (
          await ports.revoquerPartageStatistiques({
            rattachements: compte.rattachements,
          })
        ).partagesRevoques,
    ],
    [
      EffacementStep('ListesDeDiffusion'),
      async () =>
        (await ports.retirerDesListesDeDiffusion(compte.courriel)) ? 1 : 0,
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
 * étape distante a échoué. Confondre les deux ferait avaler l'un des deux.
 */
export const supprimerCompte = async ({
  command: { cible, auteur, maintenant },
  ports,
}: {
  readonly command: {
    readonly cible: UtilisateurId
    readonly auteur: AuteurSuppression
    readonly maintenant: Date
  }
  readonly ports: SupprimerComptePorts
}): Promise<Result<CompteSupprime, SupprimerCompteError>> => {
  const compte = await compteASupprimer(cible)

  if (compte === null) return failure(CompteIntrouvable(cible))

  const autorisation = autoriserSuppression(compte, auteur)

  if (!autorisation.success) return autorisation

  const identite = identiteAnonyme(
    ports.hash(`${compte.id}-${compte.courriel}`),
  )

  try {
    await couperAcces({
      utilisateurId: compte.id,
      identite,
      supprimeLe: maintenant,
      dejaAnonymise: estCourrielAnonymise(compte.courriel),
    })
  } catch (erreur) {
    return failure(AccesNonCoupe(compte.id, failureReasonOf(erreur)))
  }

  const runners = stepRunners(compte, ports)

  const results = await effacementPlan(compte.rattachements).reduce<
    Promise<readonly StepResult[]>
  >(
    async (previous, step) => [
      ...(await previous),
      await runStep(step, runners.get(step) ?? (async () => 0)),
    ],
    Promise.resolve([]),
  )

  const compteSupprime: CompteSupprime = {
    id: compte.id,
    motif: motifDe(auteur),
    supprimeLe: maintenant,
    report: report(results),
  }

  logEffacementReport(compteSupprime)

  return success(compteSupprime)
}
