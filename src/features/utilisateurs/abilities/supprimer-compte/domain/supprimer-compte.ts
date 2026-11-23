import {
  type CompteASupprimer,
  estCourrielAnonymise,
  identiteAnonyme,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { AuteurSuppression } from './auteur-suppression'
import {
  autoriserSuppression,
  type CompteSupprime,
} from './autoriser-la-suppression'
import { effacementPlan } from './effacement-plan'
import {
  ErasedCount,
  failureReasonOf,
  report,
  type StepResult,
} from './effacement-report'
import {
  AccesNonCoupe,
  CompteIntrouvable,
  type SupprimerCompteError,
} from './errors'
import { runnerDe } from './executeurs-d-etapes'
import { motifDe } from './motif-suppression'
import type { SupprimerCompteDependances, SupprimerComptePorts } from './ports'

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

export const supprimerCompte =
  (dependances: SupprimerCompteDependances) =>
  async ({
    cible,
    auteur,
    maintenant,
  }: {
    readonly cible: UtilisateurId
    readonly auteur: AuteurSuppression
    readonly maintenant: Date
  }): Promise<Result<CompteSupprime, SupprimerCompteError>> => {
    const compte = await dependances.lireLeCompteASupprimer(cible)

    if (compte === null) return failure(CompteIntrouvable(cible))

    const autorisation = autoriserSuppression(compte, auteur)

    if (!autorisation.success) return autorisation

    try {
      await dependances.couperLAcces({
        utilisateurId: compte.id,
        identite: identiteAnonyme(
          dependances.hash(`${compte.id}-${compte.courriel}`),
        ),
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
      report: report(await executerLePlan(compte, dependances)),
    }

    dependances.journaliserLEffacement(compteSupprime)

    return success(compteSupprime)
  }
