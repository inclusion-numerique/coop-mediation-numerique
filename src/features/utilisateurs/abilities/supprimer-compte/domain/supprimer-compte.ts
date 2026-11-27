import {
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
import {
  type EtapePlanifiee,
  effacementPlan,
  type Suppression,
} from './effacement-plan'
import {
  ErasedCount,
  failureReasonOf,
  report,
  type StepResult,
} from './effacement-report'
import {
  AccesNonCoupe,
  CompteIntrouvable,
  type EchecDeSupprimerCompte,
} from './errors'
import { motifDe } from './motif-suppression'
import type { EffacementsDuCompte, SupprimerComptePorts } from './ports'

const runStep = async ({
  step,
  runner,
}: EtapePlanifiee): Promise<StepResult> => {
  const resultat = await runner()

  if (!resultat.success)
    return { _tag: 'failed', step, cause: failureReasonOf(resultat.error) }

  return resultat.data === 0
    ? { _tag: 'skipped', step }
    : { _tag: 'erased', step, count: ErasedCount(resultat.data) }
}

const executerLePlan = (
  suppression: Suppression,
  effacements: EffacementsDuCompte,
): Promise<readonly StepResult[]> =>
  effacementPlan(suppression, effacements).reduce<
    Promise<readonly StepResult[]>
  >(
    async (precedents, etape) => [...(await precedents), await runStep(etape)],
    Promise.resolve([]),
  )

export const supprimerCompte =
  ({
    hash,
    lireLeCompteASupprimer,
    couperLAcces,
    journaliserLEffacement,
    ...effacements
  }: SupprimerComptePorts) =>
  async ({
    cible,
    auteur,
    maintenant,
  }: {
    readonly cible: UtilisateurId | null
    readonly auteur: AuteurSuppression
    readonly maintenant: Date
  }): Promise<Result<CompteSupprime, EchecDeSupprimerCompte>> => {
    if (cible === null) return failure(CompteIntrouvable())

    const compte = await lireLeCompteASupprimer(cible)

    if (compte === null) return failure(CompteIntrouvable())

    const autorisation = autoriserSuppression(compte, auteur)

    if (!autorisation.success) return autorisation

    const identite = identiteAnonyme(hash(`${compte.id}-${compte.courriel}`))
    const dejaAnonymise = estCourrielAnonymise(compte.courriel)

    const coupure = await couperLAcces({
      utilisateurId: compte.id,
      identite,
      supprimeLe: maintenant,
      dejaAnonymise,
    })

    if (!coupure.success)
      return failure(AccesNonCoupe(compte.id, failureReasonOf(coupure.error)))

    const compteSupprime: CompteSupprime = {
      id: compte.id,
      motif: motifDe(auteur),
      supprimeLe: maintenant,
      identite,
      dejaAnonymise,
      report: report(await executerLePlan({ compte, maintenant }, effacements)),
    }

    journaliserLEffacement(compteSupprime)

    return success(compteSupprime)
  }
