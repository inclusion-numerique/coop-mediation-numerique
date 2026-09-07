import assert from 'node:assert'
import { lieuxPublies } from '@app/web/features/lieux-activite/abilities/publier-les-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const semis: {
  lieuId?: string
  mediateurId?: string
  userId?: string
  moisson?: Awaited<ReturnType<typeof lieuxPublies>>
} = {}

const semerUnLieu = async (visiblePourCartographieNationale: boolean) => {
  const userId = v4()

  await prismaClient.user.create({
    data: {
      id: userId,
      email: `publication-${userId}@example.com`,
      name: 'Camille Aidante',
    },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId, isVisible: true },
    select: { id: true },
  })

  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Cyberbase ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      visiblePourCartographieNationale,
      services: ['AideAuxDemarchesAdministratives'],
    },
    select: { id: true },
  })

  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: mediateur.id,
      structureId: lieu.id,
      debut: new Date('2026-01-01'),
    },
  })

  semis.userId = userId
  semis.mediateurId = mediateur.id
  semis.lieuId = lieu.id
}

Given('un lieu où exerce un médiateur visible', async () => {
  await semerUnLieu(true)
})

Given('un lieu partagé où exerce un médiateur visible', async () => {
  await semerUnLieu(true)
})

Given("ce lieu n'est pas partagé sur la cartographie", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.lieuId },
    data: { visiblePourCartographieNationale: false },
  })
})

Given("ce médiateur s'est retiré du lieu", async () => {
  await prismaClient.mediateurEnActivite.updateMany({
    where: { structureId: semis.lieuId },
    data: { fin: new Date() },
  })
})

Given('ce médiateur a choisi de ne pas être visible', async () => {
  await prismaClient.mediateur.update({
    where: { id: semis.mediateurId },
    data: { isVisible: false },
  })
})

When('la cartographie nationale moissonne les lieux', async () => {
  semis.moisson = await lieuxPublies({ ids: [semis.lieuId ?? ''] })
})

Then("ce lieu n'est pas publié", () => {
  assert.strictEqual(semis.moisson?.length, 0)
})

Then('ce lieu est publié', () => {
  assert.strictEqual(semis.moisson?.length, 1)
})

Then('il annonce un aidant', () => {
  assert.strictEqual(semis.moisson?.at(0)?.aidants?.length, 1)
})

Then("il n'annonce aucun aidant", () => {
  assert.strictEqual(semis.moisson?.at(0)?.aidants?.length, 0)
})

After(async () => {
  const { lieuId, mediateurId, userId } = semis
  semis.lieuId = undefined
  semis.mediateurId = undefined
  semis.userId = undefined
  semis.moisson = undefined
  if (!lieuId) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
  if (mediateurId)
    await prismaClient.mediateur.deleteMany({ where: { id: mediateurId } })
  if (userId) await prismaClient.user.deleteMany({ where: { id: userId } })
})
