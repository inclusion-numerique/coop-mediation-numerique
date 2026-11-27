import {
  planDeChangement,
  type RolesChanges,
  type RolesDemandes,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { RetirerLesRolesVacantsPorts } from './ports'

export type RolesVacantsRetires = {
  readonly coordinateursRetires: readonly RolesChanges[]
  readonly mediateursRetires: readonly RolesChanges[]
}

const GARDER_LA_MEDIATION: RolesDemandes = {
  mediateur: true,
  coordinateur: false,
}

const GARDER_LA_COORDINATION: RolesDemandes = {
  mediateur: false,
  coordinateur: true,
}

const retirer =
  (
    demande: RolesDemandes,
    {
      lireLeCompteAReaffecter,
      appliquerLePlan,
      journaliserLeChangement,
    }: RetirerLesRolesVacantsPorts,
  ) =>
  async (utilisateurId: UtilisateurId): Promise<RolesChanges | null> => {
    const compte = await lireLeCompteAReaffecter(utilisateurId)
    if (compte === null) return null

    const plan = planDeChangement(compte, demande)
    if (!plan.success) return null

    const changement: RolesChanges = {
      utilisateurId: compte.id,
      auteur: { _tag: 'systeme' },
      plan: plan.data,
    }

    await appliquerLePlan(changement.utilisateurId, changement.plan)
    journaliserLeChangement(changement)

    return changement
  }

const retirerChacun =
  (demande: RolesDemandes, ports: RetirerLesRolesVacantsPorts) =>
  (
    utilisateurIds: readonly UtilisateurId[],
  ): Promise<readonly RolesChanges[]> =>
    utilisateurIds.reduce<Promise<readonly RolesChanges[]>>(
      async (precedents, utilisateurId) => {
        const retires = await precedents
        const changement = await retirer(demande, ports)(utilisateurId)
        return changement === null ? retires : [...retires, changement]
      },
      Promise.resolve([]),
    )

export const retirerLesRolesVacants =
  ({
    lireLesRolesVacants,
    lireLeCompteAReaffecter,
    appliquerLePlan,
    journaliserLeChangement,
  }: RetirerLesRolesVacantsPorts) =>
  async ({
    maintenant,
  }: {
    readonly maintenant: Date
  }): Promise<Result<RolesVacantsRetires, never>> => {
    const ports = {
      lireLesRolesVacants,
      lireLeCompteAReaffecter,
      appliquerLePlan,
      journaliserLeChangement,
    }
    const { coordinateursVacants, mediateursVacants } =
      await lireLesRolesVacants(maintenant)

    const coordinateursRetires = await retirerChacun(
      GARDER_LA_MEDIATION,
      ports,
    )(coordinateursVacants)

    const mediateursRetires = await retirerChacun(
      GARDER_LA_COORDINATION,
      ports,
    )(mediateursVacants.filter((id) => !coordinateursVacants.includes(id)))

    return success({ coordinateursRetires, mediateursRetires })
  }
