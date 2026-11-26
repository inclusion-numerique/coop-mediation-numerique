import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
import { changerLesRoles } from './changer-les-roles'
import type { RolesChanges } from './plan-de-changement'
import type { ChangerLesRolesPorts, RetirerLesRolesVacantsPorts } from './ports'

export type RolesVacantsRetires = {
  readonly coordinateursRetires: readonly RolesChanges[]
  readonly mediateursRetires: readonly RolesChanges[]
}

const retirer =
  (
    demande: { readonly mediateur: boolean; readonly coordinateur: boolean },
    ports: ChangerLesRolesPorts,
  ) =>
  (
    utilisateurIds: readonly UtilisateurId[],
  ): Promise<readonly RolesChanges[]> =>
    utilisateurIds.reduce<Promise<readonly RolesChanges[]>>(
      async (precedents, utilisateurId) => {
        const retires = await precedents
        const resultat = await changerLesRoles(ports)({
          utilisateurId,
          ...demande,
          auteur: { _tag: 'systeme' },
        })
        return resultat.success ? [...retires, resultat.data] : retires
      },
      Promise.resolve([]),
    )

export const retirerLesRolesVacants =
  ({ lireLesRolesVacants, ...ports }: RetirerLesRolesVacantsPorts) =>
  async ({
    maintenant,
  }: {
    readonly maintenant: Date
  }): Promise<Result<RolesVacantsRetires, never>> => {
    const { coordinateursVacants, mediateursVacants } =
      await lireLesRolesVacants(maintenant)

    const coordinateursRetires = await retirer(
      { mediateur: true, coordinateur: false },
      ports,
    )(coordinateursVacants)

    const mediateursRetires = await retirer(
      { mediateur: false, coordinateur: true },
      ports,
    )(mediateursVacants.filter((id) => !coordinateursVacants.includes(id)))

    return success({ coordinateursRetires, mediateursRetires })
  }
