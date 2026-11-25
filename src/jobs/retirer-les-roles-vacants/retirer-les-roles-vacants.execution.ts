import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import type { ChangerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles/domain/changer-les-roles'
import { changerLesRoles } from '@/features/utilisateurs/abilities/changer-les-roles/domain/changer-les-roles'
import { retirerLesRolesVacants } from '@/features/utilisateurs/abilities/changer-les-roles/domain/retirer-les-roles-vacants'
import { appliquerLePlan } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/appliquer-le-plan.mutation'
import { compteAReaffecter } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/compte-a-reaffecter.query'
import { journaliserLeChangement } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/journaliser-le-changement.mutation'
import { rolesVacants } from '@/features/utilisateurs/abilities/changer-les-roles/implementations/prisma/roles-vacants.query'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { output } from '@/libraries/console'

const changerLesRolesAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
): ChangerLesRoles =>
  changerLesRoles({
    lireLeCompteAReaffecter: compteAReaffecter,
    appliquerLePlan: appliquerLePlan(synchroniserLaPersonne),
    journaliserLeChangement,
  })

const retirerLesRolesVacantsAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  retirerLesRolesVacants({
    lireLesRolesVacants: rolesVacants,
    changerLesRoles: changerLesRolesAvec(synchroniserLaPersonne),
  })

export const executeRetirerLesRolesVacants = async () => {
  const { coordinateursRetires, mediateursRetires } =
    await retirerLesRolesVacantsAvec(synchroniserPersonne)(new Date())

  output(`${coordinateursRetires} rôles coordinateur vacants ont été retirés`)
  output(`${mediateursRetires} rôles médiateur vacants ont été retirés`)

  return { success: true, coordinateursRetires, mediateursRetires }
}
