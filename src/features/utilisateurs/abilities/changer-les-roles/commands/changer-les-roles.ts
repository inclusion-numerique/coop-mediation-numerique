import { UtilisateurIntrouvable } from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import { failure, type Result, success } from '@/libraries/result'
import {
  type AuteurDuChangement,
  type ChangerLesRolesError,
  type PlanDeChangement,
  planDeChangement,
  rolesDemandes,
} from '../domain'
import { appliquerLePlan } from '../implementations/prisma/appliquer-le-plan.mutation'
import { compteAReaffecter } from '../implementations/prisma/compte-a-reaffecter.query'
import { journaliserLeChangement } from '../implementations/prisma/journaliser-le-changement'

export const changerLesRoles = async ({
  utilisateurId,
  mediateur,
  coordinateur,
  auteur,
  synchroniserLaPersonne,
}: {
  readonly utilisateurId: string
  readonly mediateur: boolean
  readonly coordinateur: boolean
  readonly auteur: AuteurDuChangement
  readonly synchroniserLaPersonne: SynchroniserLaPersonne
}): Promise<Result<PlanDeChangement, ChangerLesRolesError>> => {
  const chrono = createStopwatch()

  const demande = rolesDemandes({ mediateur, coordinateur })
  if (!demande.success) return demande

  const compte = await compteAReaffecter(utilisateurId)
  if (compte === null) return failure(UtilisateurIntrouvable(utilisateurId))

  const plan = planDeChangement(compte, demande.data)
  if (!plan.success) return plan

  await appliquerLePlan(synchroniserLaPersonne)(compte.id, plan.data)

  journaliserLeChangement({
    utilisateurId: compte.id,
    auteurId: auteur._tag === 'administrateur' ? auteur.administrateurId : null,
    plan: plan.data,
    duree: chrono.stop().duration,
  })

  return success(plan.data)
}
