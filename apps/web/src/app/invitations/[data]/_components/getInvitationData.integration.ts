import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  coordinateurInscritAvecTout,
  coordinateurInscritAvecToutCoordinateurId,
} from '@app/fixtures/users/coordinateurInscritAvecTout'
import { prismaClient } from '@app/web/prismaClient'
import { getInvitationData } from './getInvitationData'

describe('getInvitationData', () => {
  const testEmail = 'test-get-invitation@example.com'

  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(coordinateurInscritAvecTout, false)
  })

  beforeEach(async () => {
    await prismaClient.invitationEquipe.deleteMany({
      where: { coordinateurId: coordinateurInscritAvecToutCoordinateurId },
    })
  })

  afterAll(async () => {
    await prismaClient.invitationEquipe.deleteMany({
      where: { coordinateurId: coordinateurInscritAvecToutCoordinateurId },
    })
  })

  describe('case-insensitive email lookup', () => {
    it('should find pending invitation with uppercase email when stored lowercase', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail.toLowerCase(),
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await getInvitationData({
        email: testEmail.toUpperCase(),
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).not.toBeNull()
      expect(result?.coordinateur).toBeDefined()
    })

    it('should find pending invitation with lowercase email when stored uppercase', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail.toUpperCase(),
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await getInvitationData({
        email: testEmail.toLowerCase(),
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).not.toBeNull()
    })

    it('should find pending invitation with mixed case email', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: 'TeSt-GeT-InViTaTiOn@ExAmPlE.cOm',
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await getInvitationData({
        email: 'test-get-invitation@example.com',
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).not.toBeNull()
    })
  })

  describe('invitation status filtering', () => {
    it('should not find accepted invitation', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
          acceptee: new Date(),
        },
      })

      const result = await getInvitationData({
        email: testEmail,
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).toBeNull()
    })

    it('should not find refused invitation', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
          refusee: new Date(),
        },
      })

      const result = await getInvitationData({
        email: testEmail,
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).toBeNull()
    })

    it('should find pending invitation (acceptee and refusee both null)', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
          acceptee: null,
          refusee: null,
        },
      })

      const result = await getInvitationData({
        email: testEmail,
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).not.toBeNull()
    })
  })

  describe('invitation not found', () => {
    it('should return null when invitation does not exist', async () => {
      const result = await getInvitationData({
        email: 'non-existent@example.com',
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).toBeNull()
    })

    it('should return null when coordinateurId does not match', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await getInvitationData({
        email: testEmail,
        coordinateurId: '00000000-0000-0000-0000-000000000000',
      })

      expect(result).toBeNull()
    })
  })

  describe('returned data', () => {
    it('should return coordinateur user data and mediateursCoordonnes count', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await getInvitationData({
        email: testEmail,
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      })

      expect(result).toMatchObject({
        coordinateur: {
          user: {
            name: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            email: expect.any(String),
          },
          _count: {
            mediateursCoordonnes: expect.any(Number),
          },
        },
      })
    })
  })
})
