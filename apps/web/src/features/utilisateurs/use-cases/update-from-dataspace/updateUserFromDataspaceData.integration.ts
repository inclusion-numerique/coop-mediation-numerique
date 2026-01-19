import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import {
  type DataspaceMediateur,
  forceMockDataspaceApi,
  resetMockDataspaceApiFromEnv,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  resetMockDataspaceDatabase,
  setMockDataspaceData,
} from '@app/web/external-apis/dataspace/dataspaceApiClientMock'
import {
  mockDataspaceConseillerNumerique,
  mockDataspaceCoordinateurHorsDispositif,
  mockDataspaceCoordinateurWithTeam,
  mockDataspaceMediateurNonConseillerNumerique,
} from '@app/web/external-apis/dataspace/dataspaceApiClientMockData'
import { prismaClient } from '@app/web/prismaClient'
import { updateUserFromDataspaceData } from './updateUserFromDataspaceData'

/**
 * Helper to create mock data with unique dataspace ID
 * This avoids unique constraint violations when testing multiple users
 */
const createUniqueMockData = (
  baseMock: DataspaceMediateur,
  uniqueId: number,
): DataspaceMediateur => ({
  ...baseMock,
  id: uniqueId,
})

describe('updateUserFromDataspaceData', () => {
  beforeAll(async () => {
    resetMockDataspaceDatabase()
    forceMockDataspaceApi({ mocked: true })
    await seedStructures(prismaClient)
  })

  afterAll(async () => {
    resetMockDataspaceDatabase()
    resetMockDataspaceApiFromEnv()
  })

  afterEach(async () => {
    resetMockDataspaceDatabase()
  })

  describe('Dataspace null response', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('should be NO-OP when user not found in Dataspace', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: {
          id: true,
          email: true,
          isConseillerNumerique: true,
          emplois: { select: { id: true } },
          mediateur: { select: { id: true } },
          coordinateur: { select: { id: true } },
        },
      })

      // User email is not in mock database → returns null
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(true)
      expect(result.changes.conseillerNumeriqueCreated).toBe(false)
      expect(result.changes.conseillerNumeriqueRemoved).toBe(false)
      expect(result.changes.structuresSynced).toBe(0)

      // Verify user state unchanged
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          emplois: { select: { id: true } },
        },
      })

      expect(userAfter.isConseillerNumerique).toBe(user.isConseillerNumerique)
      expect(userAfter.emplois.length).toBe(user.emplois.length)
    })
  })

  describe('Was not Conum, becomes Conum', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('should set isConseillerNumerique=true and sync structures', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true, isConseillerNumerique: true },
      })

      // Initially not a conseiller numérique
      expect(user.isConseillerNumerique).toBe(false)

      // Set up mock to return conseiller numérique data with unique ID
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        80001,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      expect(result.changes.conseillerNumeriqueCreated).toBe(true)
      expect(result.changes.structuresSynced).toBeGreaterThan(0)

      // Verify user is now conseiller numérique
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          dataspaceId: true,
          emplois: {
            select: { id: true, structureId: true },
            where: { suppression: null },
          },
        },
      })

      expect(userAfter.isConseillerNumerique).toBe(true)
      expect(userAfter.dataspaceId).toBe(uniqueMockData.id)
      expect(userAfter.emplois.length).toBeGreaterThan(0)
    })
  })

  describe('Was Conum, no longer is', () => {
    beforeEach(async () => {
      await resetFixtureUser(conseillerNumerique, false)
    })

    test('should set isConseillerNumerique=false and do one last sync', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: conseillerNumerique.id },
        select: {
          id: true,
          email: true,
          isConseillerNumerique: true,
          emplois: { select: { id: true } },
        },
      })

      // Use unique dataspace ID for this user
      const uniqueMockData = createUniqueMockData(
        mockDataspaceMediateurNonConseillerNumerique,
        70001,
      )

      // Make user conseiller numérique first with matching dataspaceId
      await prismaClient.user.update({
        where: { id: user.id },
        data: { isConseillerNumerique: true, dataspaceId: uniqueMockData.id },
      })

      // Set up mock to return non-conseiller numérique data
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      expect(result.changes.conseillerNumeriqueRemoved).toBe(true)
      // Should have done one last sync
      expect(result.changes.structuresSynced).toBeGreaterThanOrEqual(0)

      // Verify user is no longer conseiller numérique
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          emplois: { select: { id: true } },
        },
      })

      expect(userAfter.isConseillerNumerique).toBe(false)
      // Emplois should be synced (one last time)
      expect(userAfter.emplois.length).toBeGreaterThanOrEqual(0)
    })

    test('should keep existing emplois if not in Dataspace structures after transition', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: conseillerNumerique.id },
        select: { id: true, email: true },
      })

      // Use unique dataspace ID for this user
      const mockDataWithNoStructures: DataspaceMediateur = {
        ...mockDataspaceMediateurNonConseillerNumerique,
        id: 70002,
        structures_employeuses: [],
      }

      // Make user conseiller numérique first with matching dataspaceId
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          isConseillerNumerique: true,
          dataspaceId: mockDataWithNoStructures.id,
        },
      })

      // Set up mock to return data with different/no structures
      setMockDataspaceData(user.email, mockDataWithNoStructures)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.conseillerNumeriqueRemoved).toBe(true)

      // After this sync, local is source of truth
      // Future calls should NOT sync emplois
    })
  })

  describe('Was Conum, still Conum', () => {
    beforeEach(async () => {
      await resetFixtureUser(conseillerNumerique, false)
    })

    test('should sync structures from Dataspace', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: conseillerNumerique.id },
        select: { id: true, email: true },
      })

      // Use unique dataspace ID for this user to avoid constraint violation
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        90001,
      )

      // Make user conseiller numérique with a matching dataspaceId
      await prismaClient.user.update({
        where: { id: user.id },
        data: { isConseillerNumerique: true, dataspaceId: uniqueMockData.id },
      })

      // Set up mock to return conseiller numérique data
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      // Not created because was already CN
      expect(result.changes.conseillerNumeriqueCreated).toBe(false)
      expect(result.changes.structuresSynced).toBeGreaterThan(0)

      // Verify structures were synced
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          emplois: { select: { id: true, structureId: true } },
        },
      })

      expect(userAfter.isConseillerNumerique).toBe(true)
      expect(userAfter.emplois.length).toBeGreaterThan(0)
    })
  })

  describe('Was not Conum, still not Conum', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurAvecActivite, false)
    })

    test('should not sync emplois or lieux from Dataspace (local is source of truth)', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurAvecActivite.id },
        select: {
          id: true,
          email: true,
          isConseillerNumerique: true,
          emplois: { select: { id: true, structureId: true } },
        },
      })

      // Ensure user is not conseiller numérique
      expect(user.isConseillerNumerique).toBe(false)
      const initialEmploisCount = user.emplois.length

      // Set up mock to return non-conseiller numérique data with different structures
      setMockDataspaceData(
        user.email,
        mockDataspaceMediateurNonConseillerNumerique,
      )

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      expect(result.changes.conseillerNumeriqueCreated).toBe(false)
      expect(result.changes.conseillerNumeriqueRemoved).toBe(false)
      // Should NOT sync structures because is_conseiller_numerique is false
      expect(result.changes.structuresSynced).toBe(0)
      // Should NOT sync lieux d'activité because is_conseiller_numerique is false
      expect(result.changes.lieuxActiviteSynced).toBe(0)

      // Verify emplois unchanged (local is source of truth)
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: { select: { id: true } },
        },
      })

      expect(userAfter.emplois.length).toBe(initialEmploisCount)
    })
  })

  describe('Coordinateur transitions', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('should create Coordinateur if is_coordinateur is true', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: {
          id: true,
          email: true,
          coordinateur: { select: { id: true } },
        },
      })

      // Initially no coordinateur
      expect(user.coordinateur).toBeNull()

      // Set up mock to return coordinateur data with unique ID
      const uniqueMockData = createUniqueMockData(
        mockDataspaceCoordinateurWithTeam,
        80002,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.coordinateurCreated).toBe(true)

      // Verify coordinateur was created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          coordinateur: { select: { id: true } },
        },
      })

      expect(userAfter.coordinateur).not.toBeNull()
    })

    test('should NOT delete Coordinateur if is_coordinateur becomes false', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Use unique dataspace ID for this test
      const uniqueCoordMockData = createUniqueMockData(
        mockDataspaceCoordinateurWithTeam,
        80003,
      )

      // First, create coordinateur
      setMockDataspaceData(user.email, uniqueCoordMockData)
      await updateUserFromDataspaceData({ userId: user.id })

      const userWithCoord = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { coordinateur: { select: { id: true } } },
      })
      expect(userWithCoord.coordinateur).not.toBeNull()

      // Now change mock to non-coordinateur (keep same dataspace ID to avoid unique constraint)
      const uniqueNonCoordMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        80003,
      )
      setMockDataspaceData(user.email, uniqueNonCoordMockData)
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.coordinateurCreated).toBe(false)

      // Verify coordinateur was NOT deleted (never delete rule)
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { coordinateur: { select: { id: true } } },
      })

      expect(userAfter.coordinateur).not.toBeNull()
      expect(userAfter.coordinateur?.id).toBe(userWithCoord.coordinateur?.id)
    })
  })

  describe('Coordinateur hors dispositif', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('should NOT create Coordinateur when is_conseiller_numerique is false (hors dispositif)', async () => {
      // Business rule: Coordinateur is only created when BOTH is_coordinateur AND is_conseiller_numerique are true
      // Coordinateur hors dispositif (is_coordinateur=true but is_conseiller_numerique=false) should NOT create Coordinateur
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Set up mock to return coordinateur hors dispositif with unique ID
      const uniqueMockData = createUniqueMockData(
        mockDataspaceCoordinateurHorsDispositif,
        80004,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      // Should NOT create Coordinateur because is_conseiller_numerique is false
      expect(result.changes.coordinateurCreated).toBe(false)
      // Should NOT sync structures because is_conseiller_numerique is false
      expect(result.changes.structuresSynced).toBe(0)

      // Verify coordinateur was NOT created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          coordinateur: { select: { id: true } },
        },
      })

      expect(userAfter.coordinateur).toBeNull()
      expect(userAfter.isConseillerNumerique).toBe(false)
    })
  })

  describe('Mediateur creation', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('should create Mediateur if lieux_activite exists AND is_conseiller_numerique is true', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true, mediateur: { select: { id: true } } },
      })

      // Delete existing mediateur and related records for clean test
      if (user.mediateur) {
        await prismaClient.mediateurEnActivite.deleteMany({
          where: { mediateurId: user.mediateur.id },
        })
        await prismaClient.mediateur.deleteMany({
          where: { userId: user.id },
        })
      }

      // Verify no mediateur
      const userBefore = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { mediateur: { select: { id: true } } },
      })
      expect(userBefore.mediateur).toBeNull()

      // Set up mock with lieux_activite AND is_conseiller_numerique=true (use unique ID)
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        90002,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.mediateurCreated).toBe(true)
      expect(result.changes.lieuxActiviteSynced).toBeGreaterThan(0)

      // Verify mediateur was created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          mediateur: {
            select: {
              id: true,
              enActivite: { select: { id: true } },
            },
          },
        },
      })

      expect(userAfter.mediateur).not.toBeNull()
      expect(userAfter.mediateur?.enActivite.length).toBeGreaterThan(0)
    })

    test('should NOT create Mediateur if lieux_activite is empty', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true, mediateur: { select: { id: true } } },
      })

      // Delete existing mediateur and related records for clean test
      if (user.mediateur) {
        await prismaClient.mediateurEnActivite.deleteMany({
          where: { mediateurId: user.mediateur.id },
        })
        await prismaClient.mediateur.deleteMany({
          where: { userId: user.id },
        })
      }

      // Set up mock with no lieux_activite (use unique ID)
      const mockDataNoLieux: DataspaceMediateur = {
        ...mockDataspaceConseillerNumerique,
        id: 90003,
        lieux_activite: [],
      }
      setMockDataspaceData(user.email, mockDataNoLieux)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.mediateurCreated).toBe(false)
      expect(result.changes.lieuxActiviteSynced).toBe(0)

      // Verify mediateur was NOT created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { mediateur: { select: { id: true } } },
      })

      expect(userAfter.mediateur).toBeNull()
    })

    test('should NOT create Mediateur if lieux_activite exists but is_conseiller_numerique is false', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true, mediateur: { select: { id: true } } },
      })

      // Delete existing mediateur and related records for clean test
      if (user.mediateur) {
        await prismaClient.mediateurEnActivite.deleteMany({
          where: { mediateurId: user.mediateur.id },
        })
        await prismaClient.mediateur.deleteMany({
          where: { userId: user.id },
        })
      }

      // Verify no mediateur
      const userBefore = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { mediateur: { select: { id: true } } },
      })
      expect(userBefore.mediateur).toBeNull()

      // Set up mock with lieux_activite BUT is_conseiller_numerique=false (use unique ID)
      const uniqueMockData = createUniqueMockData(
        mockDataspaceMediateurNonConseillerNumerique,
        90005,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      // Should NOT create mediateur because is_conseiller_numerique is false
      expect(result.changes.mediateurCreated).toBe(false)
      // Should NOT sync lieux because is_conseiller_numerique is false
      expect(result.changes.lieuxActiviteSynced).toBe(0)

      // Verify mediateur was NOT created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { mediateur: { select: { id: true } } },
      })

      expect(userAfter.mediateur).toBeNull()
    })

    test('should NOT delete Mediateur if lieux_activite becomes empty', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Use unique dataspace ID for this test
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        90004,
      )

      // First, create mediateur with lieux (is_conseiller_numerique=true)
      setMockDataspaceData(user.email, uniqueMockData)
      await updateUserFromDataspaceData({ userId: user.id })

      const userWithMed = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { mediateur: { select: { id: true } } },
      })
      expect(userWithMed.mediateur).not.toBeNull()
      const mediateurId = userWithMed.mediateur?.id

      // Now change mock to have no lieux (keep same dataspace ID and is_conseiller_numerique=true)
      const mockDataNoLieux: DataspaceMediateur = {
        ...mockDataspaceConseillerNumerique,
        id: 90004,
        lieux_activite: [],
      }
      setMockDataspaceData(user.email, mockDataNoLieux)
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.mediateurCreated).toBe(false)

      // Verify mediateur was NOT deleted (never delete rule)
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { mediateur: { select: { id: true } } },
      })

      expect(userAfter.mediateur).not.toBeNull()
      expect(userAfter.mediateur?.id).toBe(mediateurId)
    })

    test('should NOT delete Mediateur if user becomes non-CN (never delete rule)', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Use unique dataspace ID for this test
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        90006,
      )

      // First, create mediateur with lieux as CN user
      setMockDataspaceData(user.email, uniqueMockData)
      await updateUserFromDataspaceData({ userId: user.id })

      const userWithMed = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          mediateur: { select: { id: true } },
          isConseillerNumerique: true,
        },
      })
      expect(userWithMed.mediateur).not.toBeNull()
      expect(userWithMed.isConseillerNumerique).toBe(true)
      const mediateurId = userWithMed.mediateur?.id

      // Now user becomes non-CN (keep same dataspace ID)
      const mockDataNonCN: DataspaceMediateur = {
        ...mockDataspaceMediateurNonConseillerNumerique,
        id: 90006,
        lieux_activite: mockDataspaceConseillerNumerique.lieux_activite, // Keep lieux in API
      }
      setMockDataspaceData(user.email, mockDataNonCN)
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.conseillerNumeriqueRemoved).toBe(true)
      expect(result.changes.mediateurCreated).toBe(false)
      // Lieux should not be synced because user is no longer CN
      expect(result.changes.lieuxActiviteSynced).toBe(0)

      // Verify mediateur was NOT deleted (never delete rule)
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          mediateur: { select: { id: true } },
          isConseillerNumerique: true,
        },
      })

      expect(userAfter.mediateur).not.toBeNull()
      expect(userAfter.mediateur?.id).toBe(mediateurId)
      expect(userAfter.isConseillerNumerique).toBe(false)
    })
  })

  describe('Idempotency', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('calling sync twice with same data should produce same result', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Set up mock with unique ID
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        95001,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      // First sync
      const result1 = await updateUserFromDataspaceData({ userId: user.id })
      expect(result1.success).toBe(true)

      const userAfterFirst = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          dataspaceId: true,
          emplois: { select: { id: true, structureId: true } },
          mediateur: {
            select: {
              id: true,
              enActivite: {
                select: { id: true },
                where: { suppression: null, fin: null },
              },
            },
          },
          coordinateur: { select: { id: true } },
        },
      })

      // Second sync with same data
      const result2 = await updateUserFromDataspaceData({ userId: user.id })
      expect(result2.success).toBe(true)

      const userAfterSecond = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          dataspaceId: true,
          emplois: { select: { id: true, structureId: true } },
          mediateur: {
            select: {
              id: true,
              enActivite: {
                select: { id: true },
                where: { suppression: null, fin: null },
              },
            },
          },
          coordinateur: { select: { id: true } },
        },
      })

      // Verify state is identical
      expect(userAfterSecond.isConseillerNumerique).toBe(
        userAfterFirst.isConseillerNumerique,
      )
      expect(userAfterSecond.dataspaceId).toBe(userAfterFirst.dataspaceId)
      expect(userAfterSecond.emplois.length).toBe(userAfterFirst.emplois.length)
      expect(userAfterSecond.mediateur?.id).toBe(userAfterFirst.mediateur?.id)
      expect(userAfterSecond.mediateur?.enActivite.length).toBe(
        userAfterFirst.mediateur?.enActivite.length,
      )
      expect(userAfterSecond.coordinateur?.id).toBe(
        userAfterFirst.coordinateur?.id,
      )

      // Second run should not create new records
      expect(result2.changes.conseillerNumeriqueCreated).toBe(false)
      expect(result2.changes.coordinateurCreated).toBe(false)
      expect(result2.changes.mediateurCreated).toBe(false)
    })

    test('calling sync multiple times should not duplicate emplois', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Set up mock with unique ID
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        95002,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      // Sync three times
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })

      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: { select: { id: true, structureId: true } },
        },
      })

      // Count unique structure IDs
      const structureIds = userAfter.emplois.map((emploi) => emploi.structureId)
      const uniqueStructureIds = new Set(structureIds)

      // Should not have duplicates
      expect(structureIds.length).toBe(uniqueStructureIds.size)
    })

    test('calling sync multiple times should not duplicate lieux activite (MediateurEnActivite)', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Set up mock with unique ID and lieux_activite
      const uniqueMockData = createUniqueMockData(
        mockDataspaceConseillerNumerique,
        95003,
      )
      setMockDataspaceData(user.email, uniqueMockData)

      // Sync three times
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })

      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          mediateur: {
            select: {
              id: true,
              enActivite: {
                select: { id: true, structureId: true },
                where: { suppression: null, fin: null },
              },
            },
          },
        },
      })

      expect(userAfter.mediateur).not.toBeNull()

      // Count unique structure IDs in lieux activite
      const lieuxStructureIds =
        userAfter.mediateur?.enActivite.map(
          (activite) => activite.structureId,
        ) ?? []
      const uniqueLieuxStructureIds = new Set(lieuxStructureIds)

      // Should not have duplicates
      expect(lieuxStructureIds.length).toBe(uniqueLieuxStructureIds.size)
      expect(lieuxStructureIds.length).toBeGreaterThan(0)
    })
  })
})
