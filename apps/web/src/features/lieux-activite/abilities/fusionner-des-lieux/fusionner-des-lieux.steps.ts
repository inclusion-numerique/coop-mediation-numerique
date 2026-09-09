import assert from 'node:assert'
import { fusionnerDesLieux } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const semis: {
  absorbeId?: string
  conserveId?: string
  mediateurId?: string
  userId?: string
} = {}

Given('deux lieux à fusionner', async () => {
  const [absorbe, conserve] = await Promise.all([
    prismaClient.lieuInclusion.create({
      data: {
        nom: `Cyberbase ${v4()}`,
        adresse: '12 quai du Port',
        commune: 'Rochefort',
        codePostal: '17300',
        services: ['AideAuxDemarchesAdministratives'],
      },
      select: { id: true },
    }),
    prismaClient.lieuInclusion.create({
      data: {
        nom: `Médiathèque ${v4()}`,
        adresse: '12 quai du Port',
        commune: 'Rochefort',
        codePostal: '17300',
        services: ['MaitriseDesOutilsNumeriquesDuQuotidien'],
      },
      select: { id: true },
    }),
  ])

  semis.absorbeId = absorbe.id
  semis.conserveId = conserve.id
})

const semerUnMediateur = async () => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `fusion-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })

  semis.userId = userId
  semis.mediateurId = mediateur.id

  return mediateur.id
}

const rattacher = (mediateurId: string, structureId: string) =>
  prismaClient.mediateurEnActivite.create({
    data: { mediateurId, structureId, debut: new Date('2026-01-01') },
  })

Given('un médiateur exerce dans le lieu à absorber', async () => {
  await rattacher(await semerUnMediateur(), semis.absorbeId ?? '')
})

Given('un médiateur exerce dans les deux lieux', async () => {
  const mediateurId = await semerUnMediateur()
  await rattacher(mediateurId, semis.absorbeId ?? '')
  await rattacher(mediateurId, semis.conserveId ?? '')
})

const publier = (ids: readonly (string | undefined)[]) =>
  prismaClient.lieuInclusion.updateMany({
    where: { id: { in: ids.filter((id): id is string => id != null) } },
    data: { visiblePourCartographieNationale: true },
  })

Given('les deux lieux sont publiés sur la carte nationale', async () => {
  await publier([semis.absorbeId, semis.conserveId])
})

Given('seul le lieu conservé est publié sur la carte nationale', async () => {
  await publier([semis.conserveId])
})

const poserUnReferent = (id: string | undefined, nom: string) =>
  prismaClient.lieuInclusion.updateMany({
    where: { id },
    data: {
      nomReferent: nom,
      courrielReferent: `${nom.toLowerCase()}@example.com`,
    },
  })

Given('seule la fiche à absorber porte un référent', async () => {
  await poserUnReferent(semis.absorbeId, 'Absorbe')
})

Given('les deux fiches portent un référent différent', async () => {
  await poserUnReferent(semis.absorbeId, 'Absorbe')
  await poserUnReferent(semis.conserveId, 'Conserve')
})

When("l'administration fusionne le premier dans le second", async () => {
  await fusionnerDesLieux(semis.absorbeId ?? '', semis.conserveId ?? '')
})

const compterLieu = (id?: string) =>
  prismaClient.lieuInclusion.count({ where: { id } })

Then("le lieu absorbé n'existe plus", async () => {
  assert.strictEqual(await compterLieu(semis.absorbeId), 0)
})

Then('le lieu conservé existe toujours', async () => {
  assert.strictEqual(await compterLieu(semis.conserveId), 1)
})

const activitesDuMediateurDansLeLieuConserve = () =>
  prismaClient.mediateurEnActivite.count({
    where: {
      mediateurId: semis.mediateurId,
      structureId: semis.conserveId,
      suppression: null,
      fin: null,
    },
  })

Then('ce médiateur exerce dans le lieu conservé', async () => {
  assert.strictEqual(await activitesDuMediateurDansLeLieuConserve(), 1)
})

Then("ce médiateur n'exerce qu'une fois dans le lieu conservé", async () => {
  assert.strictEqual(await activitesDuMediateurDansLeLieuConserve(), 1)
})

const lieuConserve = () =>
  prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: semis.conserveId },
    select: { visiblePourCartographieNationale: true, nomReferent: true },
  })

Then('le lieu conservé est publié sur la carte nationale', async () => {
  const { visiblePourCartographieNationale } = await lieuConserve()

  assert.strictEqual(visiblePourCartographieNationale, true)
})

Then("le lieu conservé n'est pas publié sur la carte nationale", async () => {
  const { visiblePourCartographieNationale } = await lieuConserve()

  assert.strictEqual(visiblePourCartographieNationale, false)
})

Then('le lieu conservé porte le référent de la fiche absorbée', async () => {
  const { nomReferent } = await lieuConserve()

  assert.strictEqual(nomReferent, 'Absorbe')
})

Then('le lieu conservé garde son propre référent', async () => {
  const { nomReferent } = await lieuConserve()

  assert.strictEqual(nomReferent, 'Conserve')
})

Then('le lieu conservé annonce les services des deux', async () => {
  const conserve = await prismaClient.lieuInclusion.findUnique({
    where: { id: semis.conserveId },
    select: { services: true },
  })

  assert.deepStrictEqual([...(conserve?.services ?? [])].sort(), [
    'AideAuxDemarchesAdministratives',
    'MaitriseDesOutilsNumeriquesDuQuotidien',
  ])
})

After(async () => {
  const { absorbeId, conserveId, mediateurId, userId } = semis
  semis.absorbeId = undefined
  semis.conserveId = undefined
  semis.mediateurId = undefined
  semis.userId = undefined

  const ids = [absorbeId, conserveId].filter((id): id is string => id != null)
  if (ids.length === 0) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: { in: ids } },
  })
  // La fusion inscrit le lieu survivant au registre de l'Entrepôt : son
  // inscription vit dans un autre schéma que les semis et leur survivrait.
  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: { in: ids } },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
  if (mediateurId)
    await prismaClient.mediateur.deleteMany({ where: { id: mediateurId } })
  if (userId) await prismaClient.user.deleteMany({ where: { id: userId } })
})
