import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { assignPremierAccompagnement } from './assignPremierAccompagnement'

// Helper to create test data
const createTestMediateur = async () => {
  const userId = v4()
  const mediateurId = v4()
  const structureId = v4()

  await prismaClient.structure.create({
    data: {
      id: structureId,
      nom: 'Test Structure',
      adresse: '1 rue Test',
      commune: 'Paris',
      codePostal: '75001',
    },
  })

  await prismaClient.user.create({
    data: {
      id: userId,
      email: `test-${userId}@test.com`,
      mediateur: {
        create: {
          id: mediateurId,
        },
      },
    },
  })

  return { userId, mediateurId, structureId }
}

const createTestBeneficiaire = async (mediateurId: string) => {
  const id = v4()
  await prismaClient.beneficiaire.create({
    data: {
      id,
      mediateurId,
      prenom: 'Test',
      nom: 'Beneficiaire',
      anonyme: false,
    },
  })
  return id
}

const createTestActiviteWithAccompagnement = async ({
  mediateurId,
  structureId,
  beneficiaireId,
  date,
  premierAccompagnement,
  suppression,
}: {
  mediateurId: string
  structureId: string
  beneficiaireId: string
  date: Date
  premierAccompagnement: boolean
  suppression?: Date
}) => {
  const activiteId = v4()
  const accompagnementId = v4()

  await prismaClient.activite.create({
    data: {
      id: activiteId,
      mediateurId,
      structureEmployeuseId: structureId,
      type: 'Individuel',
      typeLieu: 'Domicile',
      date,
      duree: 60,
      accompagnementsCount: 1,
      thematiques: [],
      materiel: [],
      suppression,
      accompagnements: {
        create: {
          id: accompagnementId,
          beneficiaireId,
          premierAccompagnement,
        },
      },
    },
  })

  return { activiteId, accompagnementId }
}

const getAccompagnement = async (id: string) =>
  prismaClient.accompagnement.findUnique({
    where: { id },
    select: { premierAccompagnement: true },
  })

// Cleanup helper
const cleanupTestData = async ({
  userIds,
  mediateurIds,
  structureIds,
  beneficiaireIds,
  activiteIds,
}: {
  userIds: string[]
  mediateurIds: string[]
  structureIds: string[]
  beneficiaireIds: string[]
  activiteIds: string[]
}) => {
  await prismaClient.accompagnement.deleteMany({
    where: { activiteId: { in: activiteIds } },
  })
  await prismaClient.activite.deleteMany({
    where: { id: { in: activiteIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { id: { in: beneficiaireIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: userIds } },
  })
  await prismaClient.structure.deleteMany({
    where: { id: { in: structureIds } },
  })
}

describe('assignPremierAccompagnement', () => {
  it('should return 0 changes when no beneficiaires are passed', async () => {
    const result = await assignPremierAccompagnement({ beneficiaireIds: [] })
    expect(result).toEqual({ removed: 0, added: 0 })
  })

  it('should do nothing when beneficiaire has no accompagnements', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId = await createTestBeneficiaire(mediateurId)

    try {
      const result = await assignPremierAccompagnement({
        beneficiaireIds: [beneficiaireId],
      })
      expect(result).toEqual({ removed: 0, added: 0 })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId],
        activiteIds: [],
      })
    }
  })

  it('should do nothing when premier is already correct', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId = await createTestBeneficiaire(mediateurId)

    const { activiteId: activiteId1, accompagnementId: accompagnementId1 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-01-01'),
        premierAccompagnement: true, // Correctly set as premier (earliest)
      })

    const { activiteId: activiteId2, accompagnementId: accompagnementId2 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-02-01'),
        premierAccompagnement: false,
      })

    try {
      const result = await assignPremierAccompagnement({
        beneficiaireIds: [beneficiaireId],
      })
      expect(result).toEqual({ removed: 0, added: 0 })

      // Verify nothing changed
      expect(await getAccompagnement(accompagnementId1)).toEqual({
        premierAccompagnement: true,
      })
      expect(await getAccompagnement(accompagnementId2)).toEqual({
        premierAccompagnement: false,
      })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId],
        activiteIds: [activiteId1, activiteId2],
      })
    }
  })

  it('should set premier on earliest when none is set', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId = await createTestBeneficiaire(mediateurId)

    const { activiteId: activiteId1, accompagnementId: accompagnementId1 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-01-01'), // Earliest
        premierAccompagnement: false,
      })

    const { activiteId: activiteId2, accompagnementId: accompagnementId2 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-02-01'),
        premierAccompagnement: false,
      })

    try {
      const result = await assignPremierAccompagnement({
        beneficiaireIds: [beneficiaireId],
      })
      expect(result).toEqual({ removed: 0, added: 1 })

      // Verify earliest now has premier
      expect(await getAccompagnement(accompagnementId1)).toEqual({
        premierAccompagnement: true,
      })
      expect(await getAccompagnement(accompagnementId2)).toEqual({
        premierAccompagnement: false,
      })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId],
        activiteIds: [activiteId1, activiteId2],
      })
    }
  })

  it('should reassign premier from wrong to correct accompagnement', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId = await createTestBeneficiaire(mediateurId)

    const { activiteId: activiteId1, accompagnementId: accompagnementId1 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-01-01'), // Earliest - should be premier
        premierAccompagnement: false, // But incorrectly set to false
      })

    const { activiteId: activiteId2, accompagnementId: accompagnementId2 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-02-01'),
        premierAccompagnement: true, // Incorrectly set as premier
      })

    try {
      const result = await assignPremierAccompagnement({
        beneficiaireIds: [beneficiaireId],
      })
      expect(result).toEqual({ removed: 1, added: 1 })

      // Verify premier was reassigned
      expect(await getAccompagnement(accompagnementId1)).toEqual({
        premierAccompagnement: true,
      })
      expect(await getAccompagnement(accompagnementId2)).toEqual({
        premierAccompagnement: false,
      })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId],
        activiteIds: [activiteId1, activiteId2],
      })
    }
  })

  it('should remove premier when activite is soft-deleted', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId = await createTestBeneficiaire(mediateurId)

    // Create first activite (earliest) but soft-deleted
    const { activiteId: activiteId1, accompagnementId: accompagnementId1 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-01-01'),
        premierAccompagnement: true, // Still marked as premier
        suppression: new Date(), // Soft-deleted
      })

    const { activiteId: activiteId2, accompagnementId: accompagnementId2 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-02-01'),
        premierAccompagnement: false,
      })

    try {
      const result = await assignPremierAccompagnement({
        beneficiaireIds: [beneficiaireId],
      })
      expect(result).toEqual({ removed: 1, added: 1 })

      // Verify deleted activite's accompagnement lost premier
      expect(await getAccompagnement(accompagnementId1)).toEqual({
        premierAccompagnement: false,
      })
      // Verify next one got premier
      expect(await getAccompagnement(accompagnementId2)).toEqual({
        premierAccompagnement: true,
      })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId],
        activiteIds: [activiteId1, activiteId2],
      })
    }
  })

  it('should handle multiple beneficiaires at once', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId1 = await createTestBeneficiaire(mediateurId)
    const beneficiaireId2 = await createTestBeneficiaire(mediateurId)

    // Beneficiaire 1: wrong premier
    const { activiteId: a1Act1, accompagnementId: a1Acc1 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId: beneficiaireId1,
        date: new Date('2024-01-01'),
        premierAccompagnement: false, // Should be true
      })
    const { activiteId: a1Act2, accompagnementId: a1Acc2 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId: beneficiaireId1,
        date: new Date('2024-02-01'),
        premierAccompagnement: true, // Should be false
      })

    // Beneficiaire 2: no premier set
    const { activiteId: a2Act1, accompagnementId: a2Acc1 } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId: beneficiaireId2,
        date: new Date('2024-03-01'),
        premierAccompagnement: false, // Should be true
      })

    try {
      const result = await assignPremierAccompagnement({
        beneficiaireIds: [beneficiaireId1, beneficiaireId2],
      })
      expect(result).toEqual({ removed: 1, added: 2 })

      // Verify beneficiaire 1
      expect(await getAccompagnement(a1Acc1)).toEqual({
        premierAccompagnement: true,
      })
      expect(await getAccompagnement(a1Acc2)).toEqual({
        premierAccompagnement: false,
      })

      // Verify beneficiaire 2
      expect(await getAccompagnement(a2Acc1)).toEqual({
        premierAccompagnement: true,
      })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId1, beneficiaireId2],
        activiteIds: [a1Act1, a1Act2, a2Act1],
      })
    }
  })

  it('should work with transactionClient', async () => {
    const { userId, mediateurId, structureId } = await createTestMediateur()
    const beneficiaireId = await createTestBeneficiaire(mediateurId)

    const { activiteId, accompagnementId } =
      await createTestActiviteWithAccompagnement({
        mediateurId,
        structureId,
        beneficiaireId,
        date: new Date('2024-01-01'),
        premierAccompagnement: false,
      })

    try {
      // Run inside a transaction
      await prismaClient.$transaction(async (tx) => {
        const result = await assignPremierAccompagnement({
          beneficiaireIds: [beneficiaireId],
          transactionClient: tx,
        })
        expect(result).toEqual({ removed: 0, added: 1 })
      })

      // Verify it persisted after transaction
      expect(await getAccompagnement(accompagnementId)).toEqual({
        premierAccompagnement: true,
      })
    } finally {
      await cleanupTestData({
        userIds: [userId],
        mediateurIds: [mediateurId],
        structureIds: [structureId],
        beneficiaireIds: [beneficiaireId],
        activiteIds: [activiteId],
      })
    }
  })
})
