import assert from 'node:assert'
import { rechercherDesLieuxAAjouter } from '@app/web/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/domain'
import { chercherDansLaCoop } from '@app/web/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementation'
import type { SuggestionDeLieu } from '@app/web/features/lieux-activite/domain/suggestion-de-lieu'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'

const scenario: {
  lieuATrouver?: string
  cartographie: readonly SuggestionDeLieu[]
  suggestions: readonly SuggestionDeLieu[]
} = { cartographie: [], suggestions: [] }

const lieuATrouver = (): string => {
  if (scenario.lieuATrouver == null) throw new Error('Aucun lieu à trouver')
  return scenario.lieuATrouver
}

Given(
  'un lieu « Médiathèque des Minimes » à trouver dans la coop',
  async () => {
    const lieu = await prismaClient.lieuInclusion.create({
      data: {
        nom: 'Médiathèque des Minimes',
        adresse: '5 place de la Mairie',
        commune: 'Rochefort',
        codePostal: '17300',
        codeInsee: '17299',
        banId: '17299_0123_00005',
      },
      select: { id: true },
    })

    scenario.lieuATrouver = lieu.id
  },
)

Given("ce lieu à trouver n'a pas d'adresse reconnue par la BAN", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: lieuATrouver() },
    data: { banId: null },
  })
})

Given('ce lieu à trouver est supprimé', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: lieuATrouver() },
    data: { suppression: new Date() },
  })
})

Given('la cartographie nationale connaît ce lieu à trouver', () => {
  scenario.cartographie = [
    {
      id: 'Coop-numérique_minimes__France-Services_9999',
      nom: 'Médiathèque des Minimes',
      adresse: '5 Place de la Mairie',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      complementAdresse: null,
      pivot: undefined,
      typologie: null,
      latitude: null,
      longitude: null,
      structures: [{ id: lieuATrouver() }],
      source: 'cartographie_nationale',
    },
  ]
})

When(
  'on cherche « Médiathèque des Minimes » parmi les lieux à ajouter',
  async () => {
    const resultat = await rechercherDesLieuxAAjouter({
      chercherDansLaCoop,
      chercherDansLaCartographie: async () => ({
        suggestions: scenario.cartographie,
        nombre: scenario.cartographie.length,
      }),
      chercherDansLAnnuaireDesEntreprises: async () => ({
        suggestions: [],
        nombre: 0,
      }),
    })('Médiathèque des Minimes', { limite: 100 })

    scenario.suggestions = resultat.structures
  },
)

const propositionsDuLieu = (): readonly SuggestionDeLieu[] =>
  scenario.suggestions.filter(({ structures }) =>
    structures.some(({ id }) => id === lieuATrouver()),
  )

Then('la recherche propose ce lieu à trouver', () => {
  assert.ok(propositionsDuLieu().length > 0)
})

Then('la recherche ne propose pas ce lieu à trouver', () => {
  assert.deepStrictEqual(propositionsDuLieu(), [])
})

Then('la recherche propose ce lieu à trouver une seule fois', () => {
  assert.deepStrictEqual(
    propositionsDuLieu().map(({ source }) => source),
    ['structure_locale'],
  )
})

After(async () => {
  const id = scenario.lieuATrouver
  scenario.lieuATrouver = undefined
  scenario.cartographie = []
  scenario.suggestions = []
  if (id == null) return

  await prismaClient.lieuInclusion.deleteMany({ where: { id } })
})
