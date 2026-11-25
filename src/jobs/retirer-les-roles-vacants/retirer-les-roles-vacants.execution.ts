import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesRolesVacantsAvec } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/changer-les-roles.binding'
import { output } from '@/libraries/console'

export const executeRetirerLesRolesVacants = async () => {
  const { coordinateursRetires, mediateursRetires } =
    await retirerLesRolesVacantsAvec(synchroniserPersonne)(new Date())

  output(`${coordinateursRetires} rôles coordinateur vacants ont été retirés`)
  output(`${mediateursRetires} rôles médiateur vacants ont été retirés`)

  return { success: true, coordinateursRetires, mediateursRetires }
}
