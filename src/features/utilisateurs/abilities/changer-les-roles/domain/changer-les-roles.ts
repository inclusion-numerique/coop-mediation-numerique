import { UtilisateurIntrouvable } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { AuteurDuChangement } from './auteur-du-changement'
import type { ChangerLesRolesError } from './errors'
import { type PlanDeChangement, planDeChangement } from './plan-de-changement'
import type { ChangerLesRolesPorts } from './ports'
import { rolesDemandes } from './roles-demandes'

type DemandeDeChangement = {
  readonly utilisateurId: string
  readonly mediateur: boolean
  readonly coordinateur: boolean
  readonly auteur: AuteurDuChangement
}

export type ChangerLesRoles = (
  demande: DemandeDeChangement,
) => Promise<Result<PlanDeChangement, ChangerLesRolesError>>

export const changerLesRoles =
  ({
    lireLeCompteAReaffecter,
    appliquerLePlan,
    journaliserLeChangement,
  }: ChangerLesRolesPorts): ChangerLesRoles =>
  async ({ utilisateurId, mediateur, coordinateur, auteur }) => {
    const demande = rolesDemandes({ mediateur, coordinateur })
    if (!demande.success) return demande

    const compte = await lireLeCompteAReaffecter(utilisateurId)
    if (compte === null) return failure(UtilisateurIntrouvable(utilisateurId))

    const plan = planDeChangement(compte, demande.data)
    if (!plan.success) return plan

    await appliquerLePlan(compte.id, plan.data)

    journaliserLeChangement({
      utilisateurId: compte.id,
      auteurId:
        auteur._tag === 'administrateur' ? auteur.administrateurId : null,
      plan: plan.data,
    })

    return success(plan.data)
  }
