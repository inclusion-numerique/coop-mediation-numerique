import type { UtilisateurId } from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes'
import { rolesVacants } from '../implementations/prisma/roles-vacants.query'
import { changerLesRoles } from './changer-les-roles'

const retirer =
  (
    demande: { readonly mediateur: boolean; readonly coordinateur: boolean },
    synchroniserLaPersonne: SynchroniserLaPersonne,
  ) =>
  (utilisateurIds: readonly UtilisateurId[]): Promise<number> =>
    utilisateurIds.reduce<Promise<number>>(async (precedent, utilisateurId) => {
      const retires = await precedent
      const resultat = await changerLesRoles({
        utilisateurId,
        ...demande,
        auteur: { _tag: 'systeme' },
        synchroniserLaPersonne,
      })
      return resultat.success ? retires + 1 : retires
    }, Promise.resolve(0))

export const retirerLesRolesVacants = async (
  maintenant: Date,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => {
  const { coordinateursVacants, mediateursVacants } =
    await rolesVacants(maintenant)

  const coordinateursRetires = await retirer(
    {
      mediateur: true,
      coordinateur: false,
    },
    synchroniserLaPersonne,
  )(coordinateursVacants)

  const mediateursRetires = await retirer(
    {
      mediateur: false,
      coordinateur: true,
    },
    synchroniserLaPersonne,
  )(mediateursVacants.filter((id) => !coordinateursVacants.includes(id)))

  return { coordinateursRetires, mediateursRetires }
}
