import assert from 'node:assert'
import { rechercherDesLieux } from '@app/web/features/lieux-activite/abilities/lister-tous-les-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

/**
 * La base locale porte les données de production : les assertions ne comptent
 * donc que ce que le scénario a semé, jamais ce que la commune contient.
 */
const semis: {
  ids: string[]
  denomination?: string
  siret?: string
  trouves?: Awaited<ReturnType<typeof rechercherDesLieux>>
} = { ids: [] }

Given('trois lieux à administrer, dont deux à la même adresse', async () => {
  semis.denomination = `Cyberbase du Port ${v4()}`
  semis.siret = v4().replace(/\D/g, '').padEnd(14, '0').slice(0, 14)

  const [premier, ...suivants] = await Promise.all([
    prismaClient.lieuInclusion.create({
      data: {
        nom: semis.denomination,
        siret: semis.siret,
        adresse: '12 quai du Port',
        commune: 'Rochefort',
        codePostal: '17300',
      },
      select: { id: true },
    }),
    prismaClient.lieuInclusion.create({
      data: {
        nom: `Médiathèque ${v4()}`,
        adresse: '3 rue des Livres',
        commune: 'Rochefort',
        codePostal: '17300',
      },
      select: { id: true },
    }),
    prismaClient.lieuInclusion.create({
      data: {
        nom: `Espace ailleurs ${v4()}`,
        adresse: '9 rue Lointaine',
        commune: 'Reims',
        codePostal: '51100',
      },
      select: { id: true },
    }),
  ])

  semis.ids = [premier.id, ...suivants.map(({ id }) => id)]
})

Given('le premier de ces lieux est supprimé', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.ids[0] },
    data: { suppression: new Date() },
  })
})

const chercher = async (recherche: string) => {
  semis.trouves = await rechercherDesLieux({ searchParams: { recherche } })
}

When('l’administration cherche « Cyberbase du Port »', async () => {
  await chercher(semis.denomination ?? '')
})

When('l’administration cherche « 17300 »', async () => {
  await chercher('17300')
})

When('l’administration cherche le SIRET du premier lieu', async () => {
  await chercher(semis.siret ?? '')
})

/** Les seuls lieux du scénario parmi les résultats. */
const semesTrouves = (): readonly string[] =>
  (semis.trouves?.searchResult.structures ?? [])
    .map(({ id }) => id)
    .filter((id) => semis.ids.includes(id))

Then('un seul lieu est trouvé', () => {
  assert.strictEqual(semesTrouves().length, 1)
})

Then('deux lieux sont trouvés', () => {
  assert.strictEqual(semesTrouves().length, 2)
})

Then('le total annoncé dépasse le nombre de lieux trouvés', () => {
  const trouves = semis.trouves
  assert.ok(trouves != null, 'Aucune recherche effectuée')
  assert.ok(
    trouves.totalCount > trouves.searchResult.matchesCount,
    'Le total devrait compter tous les lieux de la coop',
  )
})

After(async () => {
  const ids = semis.ids
  semis.ids = []
  semis.trouves = undefined
  if (ids.length === 0) return

  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
})
