import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { failure, success } from '@/libraries/result'
import { AucunRoleDemande } from './errors'
import { retirerLesRolesVacants } from './retirer-les-roles-vacants'

const maintenant = new Date('2026-11-26T08:00:00.000Z')

const premier = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const deuxieme = UtilisateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const troisieme = UtilisateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

describe('retirer les rôles vacants', () => {
  it('compte les rôles retirés, sans retirer deux fois le rôle d’un compte vacant des deux côtés', async () => {
    expect(
      await retirerLesRolesVacants({
        lireLesRolesVacants: async () => ({
          coordinateursVacants: [premier, deuxieme],
          mediateursVacants: [deuxieme, troisieme],
        }),
        changerLesRoles: async () => success({ operations: [] }),
      })(maintenant),
    ).toEqual({ coordinateursRetires: 2, mediateursRetires: 1 })
  })

  it('ne compte pas les rôles dont le retrait est refusé', async () => {
    expect(
      await retirerLesRolesVacants({
        lireLesRolesVacants: async () => ({
          coordinateursVacants: [premier],
          mediateursVacants: [troisieme],
        }),
        changerLesRoles: async () => failure(AucunRoleDemande()),
      })(maintenant),
    ).toEqual({ coordinateursRetires: 0, mediateursRetires: 0 })
  })
})
