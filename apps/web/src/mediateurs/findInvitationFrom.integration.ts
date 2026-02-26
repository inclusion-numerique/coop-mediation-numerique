import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  coordinateurInscritAvecTout,
  coordinateurInscritAvecToutCoordinateurId,
} from '@app/fixtures/users/coordinateurInscritAvecTout'
import { prismaClient } from '@app/web/prismaClient'
import { findInvitationFrom } from './findInvitationFrom'

describe('findInvitationFrom', () => {
  const testEmail = 'test-invitation@example.com'

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
    it('should find invitation when searching with uppercase email and stored lowercase', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail.toLowerCase(),
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await findInvitationFrom(
        coordinateurInscritAvecToutCoordinateurId,
      )(testEmail.toUpperCase())

      expect(result).not.toBeNull()
      expect(result?.email).toBe(testEmail.toLowerCase())
    })

    it('should find invitation when searching with lowercase email and stored uppercase', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail.toUpperCase(),
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await findInvitationFrom(
        coordinateurInscritAvecToutCoordinateurId,
      )(testEmail.toLowerCase())

      expect(result).not.toBeNull()
      expect(result?.email).toBe(testEmail.toUpperCase())
    })

    it('should find invitation when searching with mixed case email', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: 'TeSt-InViTaTiOn@ExAmPlE.cOm',
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await findInvitationFrom(
        coordinateurInscritAvecToutCoordinateurId,
      )('test-invitation@example.com')

      expect(result).not.toBeNull()
    })
  })

  describe('invitation not found', () => {
    it('should return null when invitation does not exist', async () => {
      const result = await findInvitationFrom(
        coordinateurInscritAvecToutCoordinateurId,
      )('non-existent@example.com')

      expect(result).toBeNull()
    })

    it('should return null when invitation exists for different coordinateur', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await findInvitationFrom(
        '00000000-0000-0000-0000-000000000000',
      )(testEmail)

      expect(result).toBeNull()
    })
  })

  describe('returned data', () => {
    it('should return invitation with coordinateur and mediateurInvite data', async () => {
      await prismaClient.invitationEquipe.create({
        data: {
          email: testEmail,
          coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        },
      })

      const result = await findInvitationFrom(
        coordinateurInscritAvecToutCoordinateurId,
      )(testEmail)

      expect(result).toMatchObject({
        email: testEmail,
        coordinateurId: coordinateurInscritAvecToutCoordinateurId,
        coordinateur: {
          user: {
            email: expect.any(String),
          },
        },
      })
    })
  })
})
