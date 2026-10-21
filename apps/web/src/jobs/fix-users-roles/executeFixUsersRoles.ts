import { output } from '@app/cli/output'
import { retirerLesRolesVacants } from '@app/web/features/utilisateurs/abilities/changer-les-roles'

export const executeFixUsersRoles = async () => {
  const { coordinateursRetires, mediateursRetires } =
    await retirerLesRolesVacants(new Date())

  output(`${coordinateursRetires} rôles coordinateur ont été supprimés`)
  output(`${mediateursRetires} rôles médiateur ont été supprimés`)

  return { success: true, coordinateursRetires, mediateursRetires }
}
