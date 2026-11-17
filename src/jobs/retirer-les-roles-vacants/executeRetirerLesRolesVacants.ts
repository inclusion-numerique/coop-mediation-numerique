import { retirerLesRolesVacants } from '@app/web/features/utilisateurs/abilities/changer-les-roles'
import { output } from '@app/web/libraries/console/output'

export const executeRetirerLesRolesVacants = async () => {
  const { coordinateursRetires, mediateursRetires } =
    await retirerLesRolesVacants(new Date())

  output(`${coordinateursRetires} rôles coordinateur vacants ont été retirés`)
  output(`${mediateursRetires} rôles médiateur vacants ont été retirés`)

  return { success: true, coordinateursRetires, mediateursRetires }
}
