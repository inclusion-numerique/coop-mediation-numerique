import { retirerLesRolesVacants } from '@/features/utilisateurs/abilities/changer-les-roles'
import { output } from '@/libraries/console/output'
import { synchroniserPersonne } from '@/libraries/registre-personne'

export const executeRetirerLesRolesVacants = async () => {
  const { coordinateursRetires, mediateursRetires } =
    await retirerLesRolesVacants(new Date(), synchroniserPersonne)

  output(`${coordinateursRetires} rôles coordinateur vacants ont été retirés`)
  output(`${mediateursRetires} rôles médiateur vacants ont été retirés`)

  return { success: true, coordinateursRetires, mediateursRetires }
}
