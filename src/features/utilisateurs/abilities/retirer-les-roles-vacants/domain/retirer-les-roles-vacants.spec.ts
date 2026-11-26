import { describe, expect, it } from 'vitest'
import {
  type CompteAReaffecter,
  CoordinateurId,
  MediateurId,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { retirerLesRolesVacants } from './retirer-les-roles-vacants'

const maintenant = new Date('2026-11-26T08:00:00.000Z')

const premier = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const deuxieme = UtilisateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const troisieme = UtilisateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')
const coordinateurId = CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e')

const compteVacant: CompteAReaffecter = {
  id: premier,
  role: RoleUtilisateur('User'),
  supprime: false,
  rattachements: rattachements(
    { id: mediateurId, activites: false, beneficiaires: false },
    {
      id: coordinateurId,
      equipe: false,
      activitesCoordination: false,
      invitationsEnAttente: false,
    },
  ),
}

const retirerAvec = (compteLu: CompteAReaffecter | null) =>
  retirerLesRolesVacants({
    lireLesRolesVacants: async () => ({
      coordinateursVacants: [premier, deuxieme],
      mediateursVacants: [deuxieme, troisieme],
    }),
    lireLeCompteAReaffecter: async () => compteLu,
    appliquerLePlan: async () => undefined,
    journaliserLeChangement: () => undefined,
  })({ maintenant })

const coordinationRetiree = {
  utilisateurId: premier,
  auteurId: null,
  plan: { operations: [{ _tag: 'RetirerCoordinateur', coordinateurId }] },
}

const mediationRetiree = {
  utilisateurId: premier,
  auteurId: null,
  plan: { operations: [{ _tag: 'RetirerMediateur', mediateurId }] },
}

describe('retirer les rôles vacants', () => {
  it('retire chaque rôle vacant, sans retirer deux fois le rôle d’un compte vacant des deux côtés', async () => {
    expect(await retirerAvec(compteVacant)).toEqual({
      success: true,
      data: {
        coordinateursRetires: [coordinationRetiree, coordinationRetiree],
        mediateursRetires: [mediationRetiree],
      },
    })
  })

  it('ne retient pas les rôles d’un compte introuvable', async () => {
    expect(await retirerAvec(null)).toEqual({
      success: true,
      data: { coordinateursRetires: [], mediateursRetires: [] },
    })
  })

  it('ne retient pas les rôles dont le retrait est refusé', async () => {
    expect(
      await retirerAvec({ ...compteVacant, role: RoleUtilisateur('Admin') }),
    ).toEqual({
      success: true,
      data: { coordinateursRetires: [], mediateursRetires: [] },
    })
  })
})
