import { prismaClient } from '@app/web/prismaClient'

// Vérifie le comportement de l'extension qui pose automatiquement `modification` / `updated`.
// Ces tests confirment aussi la casse des clés de la carte (un échec de bump = mauvaise casse).

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const apiClientId = '00000000-0000-0000-0000-00000000a001'
const userId = '00000000-0000-0000-0000-00000000a002'
const mediateurId = '00000000-0000-0000-0000-00000000a003'

const cleanup = async () => {
  await prismaClient.mediateur.deleteMany({ where: { id: mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: userId } })
  await prismaClient.apiClient.deleteMany({ where: { id: apiClientId } })
}

describe('timestampExtension', () => {
  beforeAll(async () => {
    await cleanup()
    await prismaClient.apiClient.create({
      data: {
        id: apiClientId,
        name: 'timestamp-extension-test-client',
        secretHash: 'test-hash',
        validFrom: new Date(),
      },
    })
    await prismaClient.user.create({
      data: { id: userId, email: 'timestamp-extension-test@example.com' },
    })
    await prismaClient.mediateur.create({ data: { id: mediateurId, userId } })
  })

  afterAll(async () => {
    await cleanup()
    await prismaClient.$disconnect()
  })

  describe('modèle suivi via champ `updated` (ApiClient)', () => {
    it('bumpe `updated` sur un update de contenu', async () => {
      const before = await prismaClient.apiClient.findUniqueOrThrow({
        where: { id: apiClientId },
      })

      await wait(50)
      const updated = await prismaClient.apiClient.update({
        where: { id: apiClientId },
        data: { validUntil: new Date() },
      })

      expect(updated.updated.getTime()).toBeGreaterThan(
        before.updated.getTime(),
      )
    })

    it('bumpe `updated` même à l’intérieur d’une transaction interactive', async () => {
      const before = await prismaClient.apiClient.findUniqueOrThrow({
        where: { id: apiClientId },
      })

      await wait(50)
      await prismaClient.$transaction(async (transaction) => {
        await transaction.apiClient.update({
          where: { id: apiClientId },
          data: { validUntil: new Date() },
        })
      })

      const after = await prismaClient.apiClient.findUniqueOrThrow({
        where: { id: apiClientId },
      })
      expect(after.updated.getTime()).toBeGreaterThan(before.updated.getTime())
    })

    it('bumpe `updated` sur la branche update d’un upsert', async () => {
      const before = await prismaClient.apiClient.findUniqueOrThrow({
        where: { id: apiClientId },
      })

      await wait(50)
      await prismaClient.apiClient.upsert({
        where: { id: apiClientId },
        update: { validUntil: new Date() },
        create: {
          id: apiClientId,
          name: 'timestamp-extension-test-client',
          secretHash: 'test-hash',
          validFrom: new Date(),
        },
      })

      const after = await prismaClient.apiClient.findUniqueOrThrow({
        where: { id: apiClientId },
      })
      expect(after.updated.getTime()).toBeGreaterThan(before.updated.getTime())
    })

    it('respecte une valeur `updated` posée explicitement par l’appelant', async () => {
      const explicit = new Date('2020-01-01T00:00:00.000Z')

      const updated = await prismaClient.apiClient.update({
        where: { id: apiClientId },
        data: { updated: explicit, validUntil: new Date() },
      })

      expect(updated.updated.getTime()).toBe(explicit.getTime())
    })
  })

  describe('modèle suivi via champ `modification` (Mediateur)', () => {
    it('bumpe `modification` sur un update de contenu', async () => {
      const before = await prismaClient.mediateur.findUniqueOrThrow({
        where: { id: mediateurId },
      })

      await wait(50)
      const updated = await prismaClient.mediateur.update({
        where: { id: mediateurId },
        data: { isVisible: true },
      })

      expect(updated.modification.getTime()).toBeGreaterThan(
        before.modification.getTime(),
      )
    })

    it('ne bumpe PAS `modification` si seul un compteur change', async () => {
      const before = await prismaClient.mediateur.findUniqueOrThrow({
        where: { id: mediateurId },
      })

      await wait(50)
      const updated = await prismaClient.mediateur.update({
        where: { id: mediateurId },
        data: { activitesCount: { increment: 1 } },
      })

      expect(updated.modification.getTime()).toBe(before.modification.getTime())
    })
  })

  describe('cas particulier User : suivi de session', () => {
    it('bumpe `updated` sur un update de contenu', async () => {
      const before = await prismaClient.user.findUniqueOrThrow({
        where: { id: userId },
      })

      await wait(50)
      const updated = await prismaClient.user.update({
        where: { id: userId },
        data: { firstName: 'Test' },
      })

      expect(updated.updated.getTime()).toBeGreaterThan(
        before.updated.getTime(),
      )
    })

    it('ne bumpe PAS `updated` si seul `lastSeen` change', async () => {
      const before = await prismaClient.user.findUniqueOrThrow({
        where: { id: userId },
      })

      await wait(50)
      const updated = await prismaClient.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      })

      expect(updated.updated.getTime()).toBe(before.updated.getTime())
    })
  })
})
