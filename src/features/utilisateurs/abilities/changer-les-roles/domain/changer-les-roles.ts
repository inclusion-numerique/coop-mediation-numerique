import {
  type AuteurDuChangement,
  planDeChangement,
  type RolesChanges,
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeChangerLesRoles } from './errors'
import type { ChangerLesRolesPorts } from './ports'
import { rolesDemandes } from './roles-demandes'

export const changerLesRoles =
  ({
    lireLeCompteAReaffecter,
    appliquerLePlan,
    journaliserLeChangement,
  }: ChangerLesRolesPorts) =>
  async ({
    utilisateurId,
    mediateur,
    coordinateur,
    auteur,
  }: {
    readonly utilisateurId: UtilisateurId | null
    readonly mediateur: boolean
    readonly coordinateur: boolean
    readonly auteur: AuteurDuChangement
  }): Promise<Result<RolesChanges, EchecDeChangerLesRoles>> => {
    const demande = rolesDemandes({ mediateur, coordinateur })
    if (!demande.success) return demande

    if (utilisateurId === null) return failure(UtilisateurIntrouvable())

    const compte = await lireLeCompteAReaffecter(utilisateurId)
    if (compte === null) return failure(UtilisateurIntrouvable())

    const plan = planDeChangement(compte, demande.data)
    if (!plan.success) return plan

    const changement: RolesChanges = {
      utilisateurId: compte.id,
      auteur,
      plan: plan.data,
    }

    await appliquerLePlan(changement.utilisateurId, changement.plan)
    journaliserLeChangement(changement)

    return success(changement)
  }
