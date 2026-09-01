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
        const outcome = await ports.detacherDesEquipes({
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
