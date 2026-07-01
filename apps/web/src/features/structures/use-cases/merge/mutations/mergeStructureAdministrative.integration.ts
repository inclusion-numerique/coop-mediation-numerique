import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { mergeStructureAdministrative } from './mergeStructureAdministrative'

const sourceId = v4()
const targetId = v4()
const userMovedId = v4()
const userSharedId = v4()

const seed = async () => {
  await prismaClient.user.createMany({
    data: [
      { id: userMovedId, email: `moved-${userMovedId}@example.com` },
      { id: userSharedId, email: `shared-${userSharedId}@example.com` },
    ],
  })
  await prismaClient.structureAdministrative.createMany({
    data: [
      {
        id: sourceId,
        nom: 'Employeuse Source',
        adresse: '1 rue Source',
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '75056',
        siret: '11111111111111',
        source: 'coop',
      },
      {
        id: targetId,
        // Cible sans SIRET : doit être complétée depuis la source.
        nom: 'Employeuse Cible',
        adresse: '2 rue Cible',
        commune: 'Paris',
        codePostal: '75002',
        codeInsee: '75056',
        source: 'coop',
      },
    ],
  })
  await prismaClient.employeStructure.createMany({
    data: [
      // À déplacer vers la cible.
      { id: v4(), userId: userMovedId, structureId: sourceId },
      // Doublon : userShared est déjà employé (vivant) sur la cible.
      { id: v4(), userId: userSharedId, structureId: sourceId },
      { id: v4(), userId: userSharedId, structureId: targetId },
    ],
  })
}

const cleanup = async () => {
  await prismaClient.employeStructure.deleteMany({
    where: { structureId: { in: [sourceId, targetId] } },
  })
  await prismaClient.structureAdministrative.deleteMany({
    where: { id: { in: [sourceId, targetId] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [userMovedId, userSharedId] } },
  })
}

describe('mergeStructureAdministrative', () => {
  beforeAll(async () => {
    await cleanup()
    await seed()
  })
  afterAll(cleanup)

  it('repointe les emplois, déduplique par user, complète la cible et supprime la source', async () => {
    await mergeStructureAdministrative(sourceId, targetId)

    const source = await prismaClient.structureAdministrative.findUnique({
      where: { id: sourceId },
    })
    const target = await prismaClient.structureAdministrative.findUniqueOrThrow(
      {
        where: { id: targetId },
      },
    )
    const emploisCible = await prismaClient.employeStructure.findMany({
      where: { structureId: targetId },
      select: { userId: true },
    })
    const emploisSource = await prismaClient.employeStructure.findMany({
      where: { structureId: sourceId },
    })

    // Source supprimée
    expect(source).toBeNull()
    // Identité complétée : la cible récupère le SIRET de la source
    expect(target.siret).toBe('11111111111111')
    // userMoved déplacé, userShared dédupliqué → 2 users distincts sur la cible
    const userIds = new Set(emploisCible.map((e) => e.userId))
    expect(userIds.has(userMovedId)).toBe(true)
    expect(userIds.has(userSharedId)).toBe(true)
    expect(userIds.size).toBe(2)
    // Plus aucun emploi ne pointe la source
    expect(emploisSource).toHaveLength(0)
  })
})
