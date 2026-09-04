import assert from 'node:assert'
import { inventaireDesLieux } from '@app/web/features/lieux-activite/abilities/inventorier-les-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const semis: {
  lieuId?: string
  inventaire?: Awaited<ReturnType<typeof inventaireDesLieux>>
} = {}

const DEMAIN = () => new Date(Date.now() + 24 * 60 * 60 * 1000)

Given('un lieu à inventorier', async () => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Espace inventaire ${v4()}`,
      adresse: '4 rue du Registre',
      commune: 'Rochefort',
      codePostal: '17300',
      visiblePourCartographieNationale: true,
    },
    select: { id: true },
  })

  semis.lieuId = lieu.id
})

Given('ce lieu a été retiré', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.lieuId },
    data: { suppression: new Date() },
  })
})

Given("ce lieu n'est pas partagé sur la cartographie nationale", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.lieuId },
    data: { visiblePourCartographieNationale: false },
  })
})

When("un client d'API demande l'inventaire de ce lieu", async () => {
  semis.inventaire = await inventaireDesLieux({
    ids: [semis.lieuId ?? ''],
    take: 10,
  })
})

When("un client d'API demande les lieux modifiés depuis demain", async () => {
  semis.inventaire = await inventaireDesLieux({
    ids: [semis.lieuId ?? ''],
    take: 10,
    modifieDepuis: DEMAIN(),
  })
})

Then("ce lieu figure à l'inventaire", () => {
  assert.strictEqual(semis.inventaire?.lieux.length, 1)
})

Then("ce lieu ne figure pas à l'inventaire", () => {
  assert.strictEqual(semis.inventaire?.lieux.length, 0)
})

Then('sa suppression est datée', () => {
  assert.ok(
    semis.inventaire?.lieux.at(0)?.suppression != null,
    'Le lieu supprimé devrait porter sa date de suppression',
  )
})

After(async () => {
  const id = semis.lieuId
  semis.lieuId = undefined
  semis.inventaire = undefined
  if (!id) return

  await prismaClient.lieuInclusion.deleteMany({ where: { id } })
})
