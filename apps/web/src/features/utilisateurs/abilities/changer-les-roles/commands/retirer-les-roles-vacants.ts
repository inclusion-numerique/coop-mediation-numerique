import type { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { rolesVacants } from '../implementation'
import { changerLesRoles } from './changer-les-roles'

const retirer =
  (demande: { readonly mediateur: boolean; readonly coordinateur: boolean }) =>
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

export const retirerLesRolesVacants = async (maintenant: Date) => {
  const { coordinateursVacants, mediateursVacants } =
    await rolesVacants(maintenant)

  const coordinateursRetires = await retirer({
    mediateur: true,
    coordinateur: false,
  })(coordinateursVacants)

  const mediateursRetires = await retirer({
    mediateur: false,
    coordinateur: true,
  })(mediateursVacants.filter((id) => !coordinateursVacants.includes(id)))

  return { coordinateursRetires, mediateursRetires }
}
