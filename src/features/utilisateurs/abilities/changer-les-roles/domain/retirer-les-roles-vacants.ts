import type { UtilisateurId } from '@/features/utilisateurs/domain'
import type { ChangerLesRoles } from './changer-les-roles'

type RolesVacants = {
  readonly coordinateursVacants: readonly UtilisateurId[]
  readonly mediateursVacants: readonly UtilisateurId[]
}

export type RetirerLesRolesVacantsPorts = {
  readonly lireLesRolesVacants: (maintenant: Date) => Promise<RolesVacants>
  readonly changerLesRoles: ChangerLesRoles
}

const retirer =
  (
    demande: { readonly mediateur: boolean; readonly coordinateur: boolean },
    changerLesRoles: ChangerLesRoles,
  ) =>
  (utilisateurIds: readonly UtilisateurId[]): Promise<number> =>
    utilisateurIds.reduce<Promise<number>>(async (precedent, utilisateurId) => {
      const retires = await precedent
      const resultat = await changerLesRoles({
        utilisateurId,
        ...demande,
        auteur: { _tag: 'systeme' },
      })
      return resultat.success ? retires + 1 : retires
    }, Promise.resolve(0))

export const retirerLesRolesVacants =
  ({ lireLesRolesVacants, changerLesRoles }: RetirerLesRolesVacantsPorts) =>
  async (maintenant: Date) => {
    const { coordinateursVacants, mediateursVacants } =
      await lireLesRolesVacants(maintenant)

    const coordinateursRetires = await retirer(
      { mediateur: true, coordinateur: false },
      changerLesRoles,
    )(coordinateursVacants)

    const mediateursRetires = await retirer(
      { mediateur: false, coordinateur: true },
      changerLesRoles,
    )(mediateursVacants.filter((id) => !coordinateursVacants.includes(id)))

    return { coordinateursRetires, mediateursRetires }
  }
