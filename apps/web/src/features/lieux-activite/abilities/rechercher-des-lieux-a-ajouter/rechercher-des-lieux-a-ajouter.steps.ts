import assert from 'node:assert'
import {
  RechercheDeLieu,
  rechercherDesLieuxAAjouter,
} from '@app/web/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/domain'
import { chercherDansLaCoop } from '@app/web/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementation'
import { IdentifiantCartographie } from '@app/web/features/lieux-activite/domain/ids-cartographie-nationale'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { NombreDeLieux } from '@app/web/features/lieux-activite/domain/nombres'
import {
  AdresseLibre,
  type SuggestionDeLieu,
} from '@app/web/features/lieux-activite/domain/suggestion-de-lieu'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'

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
      provenance: {
        _tag: 'Cartographie',
        identifiant: IdentifiantCartographie(
          'Coop-numérique_minimes__France-Services_9999',
        ),
        lieuCoop: LieuId(lieuATrouver()),
      },
      nom: Nom('Médiathèque des Minimes'),
      adresse: AdresseLibre({
        voie: '5 Place de la Mairie',
        commune: 'Rochefort',
        codePostal: '17300',
        codeInsee: '17299',
        complement: null,
      }),
      siret: null,
      typologies: [],
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
        nombre: NombreDeLieux(scenario.cartographie.length),
      }),
      chercherDansLAnnuaireDesEntreprises: async () => ({
        suggestions: [],
        nombre: NombreDeLieux(0),
      }),
    })(RechercheDeLieu('Médiathèque des Minimes'), { limite: 100 })

    scenario.suggestions = resultat.suggestions
  },
)

const propositionsDuLieu = (): readonly SuggestionDeLieu[] =>
  scenario.suggestions.filter(
    ({ provenance }) =>
      (provenance._tag === 'Coop' && provenance.lieuId === lieuATrouver()) ||
      (provenance._tag === 'Cartographie' &&
        provenance.lieuCoop === lieuATrouver()),
  )

Then('la recherche propose ce lieu à trouver', () => {
  assert.ok(propositionsDuLieu().length > 0)
})

Then('la recherche ne propose pas ce lieu à trouver', () => {
  assert.deepStrictEqual(propositionsDuLieu(), [])
})

Then('la recherche propose ce lieu à trouver une seule fois', () => {
  assert.deepStrictEqual(
    propositionsDuLieu().map(({ provenance }) => provenance._tag),
    ['Coop'],
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
