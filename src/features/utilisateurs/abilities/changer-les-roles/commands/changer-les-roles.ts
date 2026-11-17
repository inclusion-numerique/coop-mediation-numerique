import { UtilisateurIntrouvable } from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import { createStopwatch } from '@app/web/utils/stopwatch'
import {
  type AuteurDuChangement,
  type ChangerLesRolesError,
  type PlanDeChangement,
  planDeChangement,
  rolesDemandes,
} from '../domain'
import {
  appliquerLePlan,
  compteAReaffecter,
  journaliserLeChangement,
} from '../implementation'

export const changerLesRoles = async ({
  utilisateurId,
  mediateur,
  coordinateur,
  auteur,
}: {
  readonly utilisateurId: string
  readonly mediateur: boolean
  readonly coordinateur: boolean
  readonly auteur: AuteurDuChangement
}): Promise<Result<PlanDeChangement, ChangerLesRolesError>> => {
  const chrono = createStopwatch()

  const demande = rolesDemandes({ mediateur, coordinateur })
  if (!demande.success) return demande

  const compte = await compteAReaffecter(utilisateurId)
  if (compte === null) return failure(UtilisateurIntrouvable(utilisateurId))

  const plan = planDeChangement(compte, demande.data)
  if (!plan.success) return plan

  await appliquerLePlan(compte.id, plan.data)

  journaliserLeChangement({
    utilisateurId: compte.id,
    auteurId: auteur._tag === 'administrateur' ? auteur.administrateurId : null,
    plan: plan.data,
    duree: chrono.stop().duration,
  })

  return success(plan.data)
}
