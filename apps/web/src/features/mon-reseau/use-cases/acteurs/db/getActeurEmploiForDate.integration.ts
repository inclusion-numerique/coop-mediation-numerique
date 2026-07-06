import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { getActeurEmploiForDate } from './getActeurEmploiForDate'

const TEST_STRUCTURE_A_ID = '36b62d6d-86eb-4dfa-9cde-8dc1f0d8b387'
const TEST_STRUCTURE_B_ID = '2ef34479-f8e4-4d58-a31f-c0a575f44e15'

const createTestUser = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `test-get-emploi-${userId}@example.com`,
    },
  })
  return userId
}

const cleanupTestUser = async (userId: string) => {
  await prismaClient.employeStructure.deleteMany({
    where: { userId },
  })
  await prismaClient.user.deleteMany({
    where: { id: userId },
  })
}

const ensureTestStructures = async () => {
  // Rôle employeuse (split 1a.2) : les emplois pointent structure_administrative.
  await prismaClient.structureAdministrative.upsert({
    where: { id: TEST_STRUCTURE_A_ID },
    update: {},
    create: {
      id: TEST_STRUCTURE_A_ID,
      nom: 'Structure Test A',
      adresse: '1 rue du Test',
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75056',
      source: 'coop',
    },
  })

  await prismaClient.structureAdministrative.upsert({
    where: { id: TEST_STRUCTURE_B_ID },
    update: {},
    create: {
      id: TEST_STRUCTURE_B_ID,
      nom: 'Structure Test B',
      adresse: '2 rue du Test',
      commune: 'Lyon',
      codePostal: '69001',
      codeInsee: '69381',
      source: 'coop',
    },
  })
}

describe('getActeurEmploiForDate integration', () => {
  beforeAll(async () => {
    await ensureTestStructures()
  })

  test('should return temporary emploi for any date when no real emploi exists', async () => {
    const userId = await createTestUser()
    try {
      const temporaryEmploi = await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId: TEST_STRUCTURE_A_ID,
          debut: null,
          fin: null,
        },
        select: { id: true },
      })

      const emploiPastDate = await getActeurEmploiForDate({
        userId,
        date: new Date('2020-01-01T00:00:00.000Z'),
        strictDateBounds: false,
      })
      const emploiFutureDate = await getActeurEmploiForDate({
        userId,
        date: new Date('2040-01-01T00:00:00.000Z'),
        strictDateBounds: false,
      })

      expect(emploiPastDate.id).toBe(temporaryEmploi.id)
      expect(emploiFutureDate.id).toBe(temporaryEmploi.id)
    } finally {
      await cleanupTestUser(userId)
    }
  })

  test('should make temporary emploi valid only from day after latest ended real emploi', async () => {
    const userId = await createTestUser()
    try {
      const realEmploi = await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId: TEST_STRUCTURE_A_ID,
          debut: new Date('2024-01-01T00:00:00.000Z'),
          fin: new Date('2024-06-10T12:00:00.000Z'),
        },
        select: { id: true },
      })

      const temporaryEmploi = await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId: TEST_STRUCTURE_B_ID,
          debut: null,
          fin: null,
        },
        select: { id: true },
      })

      const emploiOnEndDate = await getActeurEmploiForDate({
        userId,
        date: new Date('2024-06-10T18:00:00.000Z'),
        strictDateBounds: false,
      })
      const emploiNextDay = await getActeurEmploiForDate({
        userId,
        date: new Date('2024-06-11T00:00:00.000Z'),
        strictDateBounds: false,
      })

      expect(emploiOnEndDate.id).toBe(realEmploi.id)
      expect(emploiNextDay.id).toBe(temporaryEmploi.id)
    } finally {
      await cleanupTestUser(userId)
    }
  })

  test('should prefer running real emploi over temporary emploi', async () => {
    const userId = await createTestUser()
    try {
      const runningRealEmploi = await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId: TEST_STRUCTURE_A_ID,
          debut: new Date('2024-01-01T00:00:00.000Z'),
          fin: null,
        },
        select: { id: true },
      })

      await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId: TEST_STRUCTURE_B_ID,
          debut: null,
          fin: null,
        },
      })

      const emploi = await getActeurEmploiForDate({
        userId,
        date: new Date('2026-01-01T00:00:00.000Z'),
        strictDateBounds: false,
      })

      expect(emploi.id).toBe(runningRealEmploi.id)
    } finally {
      await cleanupTestUser(userId)
    }
  })

  test('should keep no-emploi edge-case behavior explicit', async () => {
    const userId = await createTestUser()
    try {
      await expect(
        getActeurEmploiForDate({
          userId,
          date: new Date('2024-01-01T00:00:00.000Z'),
          strictDateBounds: false,
        }),
      ).rejects.toThrow('No emploi found for user')

      const strictEmploi = await getActeurEmploiForDate({
        userId,
        date: new Date('2024-01-01T00:00:00.000Z'),
        strictDateBounds: true,
      })
      expect(strictEmploi).toBeNull()
    } finally {
      await cleanupTestUser(userId)
    }
  })
})
