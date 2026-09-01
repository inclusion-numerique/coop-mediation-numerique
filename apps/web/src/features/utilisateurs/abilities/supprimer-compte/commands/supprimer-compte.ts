import {
  type CompteASupprimer,
  estCourrielAnonymise,
  identiteAnonyme,
  type UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import {
  AccesNonCoupe,
  type AuteurSuppression,
  autoriserSuppression,
  CompteIntrouvable,
  type CompteSupprime,
  ErasedCount,
  effacementPlan,
  failureReasonOf,
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
import { runnerDe } from './step-runners'

const runStep = async (
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
  step: StepResult['step'],
): Promise<StepResult> => {
  try {
    const count = await runnerDe(step, compte, ports)()

    return count === 0
      ? { _tag: 'skipped', step }
      : { _tag: 'erased', step, count: ErasedCount(count) }
  } catch (erreur) {
    return { _tag: 'failed', step, cause: failureReasonOf(erreur) }
  }
}

const executerLePlan = (
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
): Promise<readonly StepResult[]> =>
  effacementPlan(compte.rattachements).reduce<Promise<readonly StepResult[]>>(
    async (precedents, step) => [
      ...(await precedents),
      await runStep(compte, ports, step),
    ],
    Promise.resolve([]),
  )

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

  try {
    await couperAcces({
      utilisateurId: compte.id,
      identite: identiteAnonyme(ports.hash(`${compte.id}-${compte.courriel}`)),
      supprimeLe: maintenant,
      dejaAnonymise: estCourrielAnonymise(compte.courriel),
    })
  } catch (erreur) {
    return failure(AccesNonCoupe(compte.id, failureReasonOf(erreur)))
  }

  const compteSupprime: CompteSupprime = {
    id: compte.id,
    motif: motifDe(auteur),
    supprimeLe: maintenant,
    report: report(await executerLePlan(compte, ports)),
  }

  logEffacementReport(compteSupprime)

  return success(compteSupprime)
}
