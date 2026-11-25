import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import {
  type ChangerLesRoles,
  changerLesRoles,
} from '../domain/changer-les-roles'
import { retirerLesRolesVacants } from '../domain/retirer-les-roles-vacants'
import { appliquerLePlan } from './prisma/appliquer-le-plan.mutation'
import { compteAReaffecter } from './prisma/compte-a-reaffecter.query'
import { journaliserLeChangement } from './prisma/journaliser-le-changement.mutation'
import { rolesVacants } from './prisma/roles-vacants.query'

export const changerLesRolesAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
): ChangerLesRoles =>
  changerLesRoles({
    lireLeCompteAReaffecter: compteAReaffecter,
    appliquerLePlan: appliquerLePlan(synchroniserLaPersonne),
    journaliserLeChangement,
  })

export const retirerLesRolesVacantsAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  retirerLesRolesVacants({
    lireLesRolesVacants: rolesVacants,
    changerLesRoles: changerLesRolesAvec(synchroniserLaPersonne),
  })
