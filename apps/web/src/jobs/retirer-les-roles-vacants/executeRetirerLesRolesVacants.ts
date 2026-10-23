import { output } from '@app/cli/output'
import { retirerLesRolesVacants } from '@app/web/features/utilisateurs/abilities/changer-les-roles'

export const executeRetirerLesRolesVacants = async () => {
  const { coordinateursRetires, mediateursRetires } =
    await retirerLesRolesVacants(new Date())

  output(`${coordinateursRetires} rôles coordinateur vacants ont été retirés`)
  output(`${mediateursRetires} rôles médiateur vacants ont été retirés`)

  return { success: true, coordinateursRetires, mediateursRetires }
}
