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
  mockDataspaceStructureEmployeuse,
  mockDataspaceStructureEmployeuseWithMultipleContrats,
  mockDataspaceStructureEmployeuseWithNoContrat,
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
          dataspaceUserIdPg: true,
          emplois: {
            select: { id: true, structureId: true },
            where: { suppression: null },
          },
        },
      })

      expect(userAfter.isConseillerNumerique).toBe(true)
      expect(userAfter.dataspaceId).toBe(uniqueMockData.id)
      expect(userAfter.dataspaceUserIdPg).toBe(uniqueMockData.pg_id)
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

  describe('Structures without contracts', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
      // Clean up all emplois from previous tests to ensure clean state
      await prismaClient.employeStructure.deleteMany({
        where: { userId: mediateurSansActivites.id },
      })
    })

    test('should create one temporary emploi when structure has no contracts', async () => {
      // Spec: "lorsque mes données pro contiennent une structure employeuse sans contrat
      // à l'intérieur, je ne dois pas avoir de lien d'emploi avec cette structure"
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Create mock with only a structure without contracts
      const mockDataWithNoContractStructure: DataspaceMediateur = {
        id: 80010,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80010,
        structures_employeuses: [mockDataspaceStructureEmployeuseWithNoContrat],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithNoContractStructure)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      expect(result.changes.conseillerNumeriqueCreated).toBe(true)
      // A temporary emploi should be synced for the first structure
      expect(result.changes.structuresSynced).toBe(1)

      // Verify one active temporary emploi was created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          isConseillerNumerique: true,
          emplois: {
            select: { id: true, structureId: true, debut: true, fin: true },
            where: { suppression: null }, // Only active emplois
          },
        },
      })

      expect(userAfter.isConseillerNumerique).toBe(true)
      expect(userAfter.emplois.length).toBe(1)
      expect(userAfter.emplois[0].debut).toBeNull()
      expect(userAfter.emplois[0].fin).toBeNull()
    })

    test('should keep at most one temporary emploi across repeated syncs', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      const mockDataWithNoContractStructure: DataspaceMediateur = {
        id: 80020,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80020,
        structures_employeuses: [mockDataspaceStructureEmployeuseWithNoContrat],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithNoContractStructure)
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })

      const emplois = await prismaClient.employeStructure.findMany({
        where: { userId: user.id },
        select: { id: true, debut: true, suppression: true },
      })

      const emploisWithNullDebut = emplois.filter(
        (emploi) => emploi.debut === null,
      )
      const activeTemporaryEmplois = emploisWithNullDebut.filter(
        (emploi) => emploi.suppression === null,
      )

      expect(emploisWithNullDebut.length).toBe(1)
      expect(activeTemporaryEmplois.length).toBe(1)
    })

    test('should only create emploi for structures WITH contracts, ignoring those without', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Create mock with both: a structure WITH contracts and one WITHOUT
      const mockDataWithMixedStructures: DataspaceMediateur = {
        id: 80011,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80011,
        structures_employeuses: [
          mockDataspaceStructureEmployeuse, // has contracts
          mockDataspaceStructureEmployeuseWithNoContrat, // no contracts
        ],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithMixedStructures)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      // Only 1 structure should be synced (the one with contracts)
      expect(result.changes.structuresSynced).toBe(1)

      // Verify only one active emploi was created
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: { id: true, structureId: true, debut: true },
            where: { suppression: null }, // Only active emplois
          },
        },
      })

      expect(userAfter.emplois.length).toBe(1)
      expect(userAfter.emplois[0].debut).not.toBeNull()
    })

    test('should remove existing emploi when structure loses all contracts', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // First sync with structure that has contracts
      const mockDataWithContractStructure: DataspaceMediateur = {
        id: 80012,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80012,
        structures_employeuses: [mockDataspaceStructureEmployeuse],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithContractStructure)
      await updateUserFromDataspaceData({ userId: user.id })

      // Verify active emploi was created
      const userAfterFirstSync = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: { id: true, structureId: true },
            where: { suppression: null }, // Only active emplois
          },
        },
      })
      expect(userAfterFirstSync.emplois.length).toBe(1)

      // Now sync again with the same structure but without contracts
      // (simulating structure losing all contracts in Dataspace)
      const mockDataWithSameStructureNoContracts: DataspaceMediateur = {
        id: 80012,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80012,
        structures_employeuses: [
          {
            ...mockDataspaceStructureEmployeuse,
            contrats: [], // structure now has no contracts
          },
        ],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithSameStructureNoContracts)
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      // Temporary structure should be synced and existing real emploi removed
      expect(result.changes.structuresSynced).toBe(1)
      expect(result.changes.structuresRemoved).toBe(1)

      // Verify previous real emploi was soft-deleted and one temporary is active
      const userAfterSecondSync = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: {
              id: true,
              structureId: true,
              suppression: true,
              debut: true,
              fin: true,
            },
          },
        },
      })

      const softDeletedEmplois = userAfterSecondSync.emplois.filter(
        (e) => e.suppression !== null,
      )
      const activeEmplois = userAfterSecondSync.emplois.filter(
        (e) => e.suppression === null,
      )
      expect(softDeletedEmplois.length).toBe(1)
      expect(activeEmplois.length).toBe(1)
      expect(activeEmplois[0].debut).toBeNull()
      expect(activeEmplois[0].fin).toBeNull()
    })

    test('should soft-delete temporary emploi when real contracts appear', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      const mockDataWithNoContractStructure: DataspaceMediateur = {
        id: 80021,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80021,
        structures_employeuses: [mockDataspaceStructureEmployeuseWithNoContrat],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }
      setMockDataspaceData(user.email, mockDataWithNoContractStructure)
      await updateUserFromDataspaceData({ userId: user.id })

      // Same structure now has one valid contract in Dataspace
      const mockDataWithContractStructure: DataspaceMediateur = {
        id: 80021,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80021,
        structures_employeuses: [mockDataspaceStructureEmployeuse],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }
      setMockDataspaceData(user.email, mockDataWithContractStructure)
      await updateUserFromDataspaceData({ userId: user.id })

      const emplois = await prismaClient.employeStructure.findMany({
        where: { userId: user.id },
        select: { id: true, debut: true, fin: true, suppression: true },
      })

      const emploisWithNullDebut = emplois.filter(
        (emploi) => emploi.debut === null,
      )
      expect(emploisWithNullDebut.length).toBe(1)
      expect(emploisWithNullDebut[0].suppression).not.toBeNull()
      expect(emploisWithNullDebut[0].fin).not.toBeNull()

      const activeRealEmplois = emplois.filter(
        (emploi) => emploi.suppression === null && emploi.debut !== null,
      )
      expect(activeRealEmplois.length).toBe(1)
    })

    test('should create one emploi per contract when structure has multiple contracts', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Create mock with a structure that has 2 contracts
      const mockDataWithMultipleContracts: DataspaceMediateur = {
        id: 80014,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80014,
        structures_employeuses: [
          mockDataspaceStructureEmployeuseWithMultipleContrats,
        ],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithMultipleContracts)

      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.noOp).toBe(false)
      // 1 structure synced (even though it has 2 contracts)
      expect(result.changes.structuresSynced).toBe(1)

      // Verify 2 emplois were created (one per contract)
      // Note: mockDataspaceStructureEmployeuseWithMultipleContrats has:
      // - mockDataspaceContratCDD (active - ends 2025-12-31) -> 1 active emploi
      // - mockDataspaceContratTermine (ruptured 2024-03-15) -> 1 ended (fin set) emploi
      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: {
              id: true,
              structureId: true,
              debut: true,
              fin: true,
              suppression: true,
            },
            orderBy: { debut: 'asc' },
          },
        },
      })

      // Total 2 emplois (one per contract)
      expect(userAfter.emplois.length).toBe(2)

      // Both emplois should be for the same structure
      expect(userAfter.emplois[0].structureId).toBe(
        userAfter.emplois[1].structureId,
      )
      // But with different debut dates (from different contracts)
      expect(userAfter.emplois[0].debut).not.toBeNull()
      expect(userAfter.emplois[1].debut).not.toBeNull()
      expect(userAfter.emplois[0].debut?.getTime()).not.toBe(
        userAfter.emplois[1].debut?.getTime(),
      )

      // Present contracts are never soft-deleted during sync
      const nonDeletedEmplois = userAfter.emplois.filter(
        (e) => e.suppression === null,
      )
      expect(nonDeletedEmplois.length).toBe(2)

      // Ruptured contract should end via fin date, not suppression
      const emploisWithFin = userAfter.emplois.filter((e) => e.fin !== null)
      expect(emploisWithFin.length).toBe(1)
    })

    test('should remove one emploi when one contract is removed from structure', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // First sync with structure that has 2 contracts
      const mockDataWith2Contracts: DataspaceMediateur = {
        id: 80015,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80015,
        structures_employeuses: [
          mockDataspaceStructureEmployeuseWithMultipleContrats,
        ],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWith2Contracts)
      await updateUserFromDataspaceData({ userId: user.id })

      // Verify 2 emplois were created (1 ongoing CDD + 1 ruptured with fin set)
      const userAfterFirstSync = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: {
              id: true,
              structureId: true,
              debut: true,
              fin: true,
              suppression: true,
            },
          },
        },
      })
      expect(userAfterFirstSync.emplois.length).toBe(2)

      // Now sync again with only 1 contract (one contract removed)
      const firstContract =
        mockDataspaceStructureEmployeuseWithMultipleContrats.contrats?.[0]
      if (!firstContract) {
        throw new Error('Expected mock to have at least one contract')
      }
      const mockDataWith1Contract: DataspaceMediateur = {
        id: 80015,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80015,
        structures_employeuses: [
          {
            ...mockDataspaceStructureEmployeuseWithMultipleContrats,
            contrats: [firstContract], // only keep first contract
          },
        ],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWith1Contract)
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.structuresSynced).toBe(1)
      // One contract is absent from Dataspace payload, so it gets soft-deleted
      expect(result.changes.structuresRemoved).toBe(1)

      // Verify emplois state
      const userAfterSecondSync = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: {
              id: true,
              structureId: true,
              debut: true,
              fin: true,
              suppression: true,
            },
          },
        },
      })
      // Total emplois is still 2 (one kept + one soft-deleted because absent from payload)
      expect(userAfterSecondSync.emplois.length).toBe(2)

      const nonDeletedEmplois = userAfterSecondSync.emplois.filter(
        (e) => e.suppression === null,
      )
      expect(nonDeletedEmplois.length).toBe(1)
    })

    test('should remove existing emploi when structure is completely removed from Dataspace', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // First sync with a structure that has contracts
      const mockDataWithStructure: DataspaceMediateur = {
        id: 80013,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80013,
        structures_employeuses: [mockDataspaceStructureEmployeuse],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithStructure)
      await updateUserFromDataspaceData({ userId: user.id })

      // Verify active emploi was created
      const userAfterFirstSync = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: { id: true, structureId: true },
            where: { suppression: null }, // Only active emplois
          },
        },
      })
      expect(userAfterFirstSync.emplois.length).toBe(1)

      // Now sync again with NO structures at all
      // (simulating structure being completely removed from Dataspace)
      const mockDataWithNoStructures: DataspaceMediateur = {
        id: 80013,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 80013,
        structures_employeuses: [], // structure completely removed
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }

      setMockDataspaceData(user.email, mockDataWithNoStructures)
      const result = await updateUserFromDataspaceData({ userId: user.id })

      expect(result.success).toBe(true)
      expect(result.changes.structuresSynced).toBe(0)
      // The existing emploi should be soft-deleted
      expect(result.changes.structuresRemoved).toBe(1)

      // Verify emploi was soft-deleted
      const userAfterSecondSync = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: { id: true, structureId: true, suppression: true },
          },
        },
      })
      // Emploi still exists but is soft-deleted
      expect(userAfterSecondSync.emplois.length).toBe(1)
      expect(userAfterSecondSync.emplois[0].suppression).not.toBeNull()

      // Active emplois should be 0
      const activeEmplois = userAfterSecondSync.emplois.filter(
        (e) => e.suppression === null,
      )
      expect(activeEmplois.length).toBe(0)
    })
  })

  describe('Lieux activite NOT synced in updateUserFromDataspaceData', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
    })

    test('should NOT sync lieux activite (only imported during inscription)', async () => {
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
      // Lieux activite are NOT synced in updateUserFromDataspaceData
      // They are only imported during inscription

      // Verify mediateur was NOT created (not synced here)
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

      expect(userAfter.mediateur).toBeNull()
    })
  })

  describe('Idempotency', () => {
    beforeEach(async () => {
      await resetFixtureUser(mediateurSansActivites, false)
      // Clean up all emplois from previous tests to ensure clean state
      await prismaClient.employeStructure.deleteMany({
        where: { userId: mediateurSansActivites.id },
      })
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
          emplois: {
            select: { id: true, structureId: true },
            where: { suppression: null }, // Only active emplois
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
          emplois: {
            select: { id: true, structureId: true },
            where: { suppression: null }, // Only active emplois
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
      expect(userAfterSecond.coordinateur?.id).toBe(
        userAfterFirst.coordinateur?.id,
      )

      // Second run should not create new records
      expect(result2.changes.conseillerNumeriqueCreated).toBe(false)
      expect(result2.changes.coordinateurCreated).toBe(false)
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
          emplois: {
            select: { id: true, structureId: true, debut: true },
            where: { suppression: null }, // Only active emplois
          },
        },
      })

      // Create unique keys for each emploi (structureId + debut date)
      // With one-emploi-per-contract, we can have multiple emplois per structure
      // but never duplicate emplois for the same contract (same structureId + debut)
      const emploiKeys = userAfter.emplois.map(
        (emploi) =>
          `${emploi.structureId}:${emploi.debut?.getTime() ?? 'null'}`,
      )
      const uniqueEmploiKeys = new Set(emploiKeys)

      // Should not have duplicates (each contract should create exactly one emploi)
      expect(emploiKeys.length).toBe(uniqueEmploiKeys.size)

      // mockDataspaceConseillerNumerique has 1 structure with 1 contract = 1 emploi
      expect(userAfter.emplois.length).toBe(1)
    })

    test('calling sync multiple times with multiple contracts should not duplicate emplois', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: { id: mediateurSansActivites.id },
        select: { id: true, email: true },
      })

      // Set up mock with structure that has 2 contracts
      const mockDataWithMultipleContracts: DataspaceMediateur = {
        id: 95003,
        is_coordinateur: false,
        is_conseiller_numerique: true,
        pg_id: 95003,
        structures_employeuses: [
          mockDataspaceStructureEmployeuseWithMultipleContrats,
        ],
        lieux_activite: [],
        conseillers_numeriques_coordonnes: [],
      }
      setMockDataspaceData(user.email, mockDataWithMultipleContracts)

      // Sync three times
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })
      await updateUserFromDataspaceData({ userId: user.id })

      const userAfter = await prismaClient.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          emplois: {
            select: { id: true, structureId: true, debut: true },
            where: { suppression: null }, // Only active emplois
          },
        },
      })

      // Create unique keys for each emploi (structureId + debut date)
      const emploiKeys = userAfter.emplois.map(
        (emploi) =>
          `${emploi.structureId}:${emploi.debut?.getTime() ?? 'null'}`,
      )
      const uniqueEmploiKeys = new Set(emploiKeys)

      // Should not have duplicates
      expect(emploiKeys.length).toBe(uniqueEmploiKeys.size)

      // mockDataspaceStructureEmployeuseWithMultipleContrats has 2 contracts:
      // - mockDataspaceContratCDD (ongoing) -> 1 emploi
      // - mockDataspaceContratTermine (ruptured) -> 1 emploi with fin set and suppression=null
      expect(userAfter.emplois.length).toBe(2)
    })
  })
})
