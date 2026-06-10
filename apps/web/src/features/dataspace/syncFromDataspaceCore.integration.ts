import type { DataspaceStructureEmployeuse } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { syncStructuresEmployeusesFromDataspace } from './syncFromDataspaceCore'

const completeAdresse = {
  numero_voie: 39,
  repetition: null,
  nom_voie: 'Rue Mazagran',
  code_postal: '53000',
  code_insee: '53130',
  nom_commune: 'Laval',
}

const incompleteAdresse = {
  ...completeAdresse,
  nom_voie: null,
}

const structureEmployeuse = ({
  siret,
  contrats,
}: Pick<
  DataspaceStructureEmployeuse,
  'siret' | 'contrats'
>): DataspaceStructureEmployeuse => ({
  nom: 'Département de la Mayenne',
  siret,
  ids: null,
  contact: null,
  adresse: incompleteAdresse,
  contrats,
})

const contrat = ({ date_debut }: { date_debut: string | null }) => ({
  type: 'CDD',
  date_debut,
  date_fin: '2027-09-30',
  date_rupture: null,
})

const randomSiret = () =>
  `9${Math.floor(Math.random() * 10 ** 13)
    .toString()
    .padStart(13, '0')}`

const createTestUser = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `test-sync-emplois-${userId}@example.com`,
    },
  })
  return userId
}

const createTestStructure = async ({ siret }: { siret: string | null }) => {
  const structureId = v4()
  await prismaClient.structure.create({
    data: {
      id: structureId,
      nom: 'Structure employeuse de test',
      siret,
      adresse: '39 Rue Mazagran',
      commune: 'Laval',
      codePostal: '53000',
      codeInsee: '53130',
    },
  })
  return structureId
}

const cleanupTestUser = async (userId: string) => {
  const emplois = await prismaClient.employeStructure.findMany({
    where: { userId },
    select: { structureId: true },
  })
  await prismaClient.employeStructure.deleteMany({ where: { userId } })
  await prismaClient.structure.deleteMany({
    where: { id: { in: emplois.map(({ structureId }) => structureId) } },
  })
  await prismaClient.user.deleteMany({ where: { id: userId } })
}

const getEmplois = (userId: string) =>
  prismaClient.employeStructure.findMany({
    where: { userId },
    select: { id: true, structureId: true, debut: true, suppression: true },
    orderBy: { creation: 'asc' },
  })

describe('syncStructuresEmployeusesFromDataspace integration', () => {
  test('keeps existing emplois untouched when all payload structures are unresolvable (safety net)', async () => {
    const userId = await createTestUser()
    try {
      const structureId = await createTestStructure({ siret: null })
      await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId,
          debut: new Date('2024-10-01'),
        },
      })

      // Incomplete address and no emploi shares this SIRET: nothing resolvable
      const { removed } = await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: [
          structureEmployeuse({
            siret: randomSiret(),
            contrats: [contrat({ date_debut: '2024-10-01' })],
          }),
        ],
      })

      expect(removed).toBe(0)
      const emplois = await getEmplois(userId)
      expect(emplois).toHaveLength(1)
      expect(emplois[0].suppression).toBeNull()
    } finally {
      await cleanupTestUser(userId)
    }
  })

  test('still sweeps emplois when the payload has no structure employeuse (legitimate removal)', async () => {
    const userId = await createTestUser()
    try {
      const structureId = await createTestStructure({ siret: randomSiret() })
      await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId,
          debut: new Date('2024-10-01'),
        },
      })

      const { removed } = await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: [],
      })

      expect(removed).toBe(1)
      const emplois = await getEmplois(userId)
      expect(emplois).toHaveLength(1)
      expect(emplois[0].suppression).not.toBeNull()
    } finally {
      await cleanupTestUser(userId)
    }
  })

  test('reactivates a soft-deleted emploi matched by SIRET when the payload address is incomplete', async () => {
    const userId = await createTestUser()
    try {
      const siret = randomSiret()
      const structureId = await createTestStructure({ siret })
      const suppressed = await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId,
          debut: new Date('2024-10-01'),
          fin: new Date('2026-06-02'),
          suppression: new Date('2026-06-02'),
        },
        select: { id: true },
      })

      const { removed } = await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: [
          structureEmployeuse({
            siret,
            contrats: [contrat({ date_debut: '2024-10-01' })],
          }),
        ],
      })

      expect(removed).toBe(0)
      const emplois = await getEmplois(userId)
      expect(emplois).toHaveLength(1)
      expect(emplois[0].id).toBe(suppressed.id)
      expect(emplois[0].suppression).toBeNull()
    } finally {
      await cleanupTestUser(userId)
    }
  })

  test('links the temporary contract through an existing emploi SIRET when the payload address is incomplete', async () => {
    const userId = await createTestUser()
    try {
      const siret = randomSiret()
      const structureId = await createTestStructure({ siret })
      await prismaClient.employeStructure.create({
        data: {
          userId,
          structureId,
          debut: null,
          fin: null,
        },
        select: { id: true },
      })

      // Contract without date_debut goes through the temporary contract path
      const { removed } = await syncStructuresEmployeusesFromDataspace({
        userId,
        structuresEmployeuses: [
          structureEmployeuse({
            siret,
            contrats: [contrat({ date_debut: null })],
          }),
        ],
      })

      expect(removed).toBe(0)
      const emplois = await getEmplois(userId)
      expect(emplois).toHaveLength(1)
      expect(emplois[0].structureId).toBe(structureId)
      expect(emplois[0].suppression).toBeNull()
    } finally {
      await cleanupTestUser(userId)
    }
  })
})
