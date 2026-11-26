import { UtilisateurIntrouvable } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { AuteurDuChangement } from './auteur-du-changement'
import type { EchecDeChangerLesRoles } from './errors'
import { planDeChangement, type RolesChanges } from './plan-de-changement'
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
    readonly utilisateurId: string
    readonly mediateur: boolean
    readonly coordinateur: boolean
    readonly auteur: AuteurDuChangement
  }): Promise<Result<RolesChanges, EchecDeChangerLesRoles>> => {
    const demande = rolesDemandes({ mediateur, coordinateur })
    if (!demande.success) return demande

    const compte = await lireLeCompteAReaffecter(utilisateurId)
    if (compte === null) return failure(UtilisateurIntrouvable())

    const plan = planDeChangement(compte, demande.data)
    if (!plan.success) return plan

    const changement: RolesChanges = {
      utilisateurId: compte.id,
      auteurId:
        auteur._tag === 'administrateur' ? auteur.administrateurId : null,
      plan: plan.data,
    }

    await appliquerLePlan(changement.utilisateurId, changement.plan)
    journaliserLeChangement(changement)

    return success(changement)
  }
