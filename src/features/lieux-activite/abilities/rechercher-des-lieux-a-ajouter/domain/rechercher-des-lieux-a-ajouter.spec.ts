import { Nom, Siret } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { NombreDeLieux } from '../../../domain/nombres'
import { SourceExterne } from '../../../domain/registre/source-externe'
import {
  AdresseLibre,
  type ProvenanceDeSuggestion,
  type SuggestionDeLieu,
} from '../../../domain/suggestion-de-lieu'
import { SourceIndisponible } from './errors'
import type { RechercherDesLieuxAAjouterPorts } from './ports'
import { RechercheDeLieu } from './recherche-de-lieu'
import { rechercherDesLieuxAAjouter } from './rechercher-des-lieux-a-ajouter'
import { TermeDeRecherche } from './terme-de-recherche'

const LIEU_COOP = LieuId('550e8400-e29b-41d4-a716-446655440000')

const suggestion = (
  nom: string,
  provenance: ProvenanceDeSuggestion,
): SuggestionDeLieu => ({
  provenance,
  nom: Nom(nom),
  adresse: AdresseLibre({
    voie: '',
    commune: '',
    codePostal: '',
    codeInsee: null,
    complement: null,
  }),
  siret: null,
  typologies: [],
})

const deLaCoop = (nom: string) =>
  suggestion(nom, { _tag: 'Coop', lieuId: LIEU_COOP })

const deLaCarto = (nom: string, lieuCoop: LieuId | null) =>
  suggestion(nom, {
    _tag: 'Cartographie',
    identifiant: IdentifiantCartographie(nom),
    lieuCoop,
  })

const deLAnnuaire = (nom: string) =>
  suggestion(nom, { _tag: 'Annuaire', siret: Siret('13002603200016') })

const coop = deLaCoop('coop')
const carto = deLaCarto('carto', null)
const cartoConnueDeLaCoop = deLaCarto('carto-connu', LIEU_COOP)
const annuaire = deLAnnuaire('api')

const rien = { suggestions: [], nombre: NombreDeLieux(0) }

const sourcesVides: RechercherDesLieuxAAjouterPorts = {
  chercherDansLaCoop: async () => rien,
  chercherDansLaCartographie: async () => success(rien),
  chercherDansLAnnuaireDesEntreprises: async () => success(rien),
}

const cartographieEnPanne = async () =>
  failure(SourceIndisponible(SourceExterne('Cartographie')))

const annuaireEnPanne = async () =>
  failure(SourceIndisponible(SourceExterne('Annuaire')))

const rechercher = (
  ports: RechercherDesLieuxAAjouterPorts,
  texte: string,
  limite: NombreDeLieux,
) =>
  rechercherDesLieuxAAjouter(ports)({
    recherche: RechercheDeLieu(texte),
    limite,
  })

const cinquante = NombreDeLieux(50)

describe('lire une recherche de lieu', () => {
  it.each<[string, RechercheDeLieu]>([
    ['Mé', { _tag: 'TropCourte' }],
    ['  Mé  ', { _tag: 'TropCourte' }],
    [
      '123456789',
      { _tag: 'ParNumeroDEntreprise', terme: TermeDeRecherche('123456789') },
    ],
    [
      '123 456 789 00012',
      {
        _tag: 'ParNumeroDEntreprise',
        terme: TermeDeRecherche('12345678900012'),
      },
    ],
    ['12345678', { _tag: 'ParNom', terme: TermeDeRecherche('12345678') }],
    [
      'Médiathèque 123456789',
      { _tag: 'ParNom', terme: TermeDeRecherche('Médiathèque 123456789') },
    ],
  ])('« %s »', (texte, attendu) => {
    expect(RechercheDeLieu(texte)).toEqual(attendu)
  })
})

describe('rechercher des lieux à ajouter', () => {
  it('ne cherche rien en dessous de trois caractères', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCoop: async () => ({ ...rien, suggestions: [coop] }),
        },
        'Mé',
        cinquante,
      ),
    ).toEqual(success({ suggestions: [], nombre: 0, sourcesEnPanne: [] }))
  })

  it('cherche un SIRET dans la coop sans consulter la cartographie', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCoop: async () => ({
            suggestions: [coop],
            nombre: NombreDeLieux(1),
          }),
          chercherDansLaCartographie: async () =>
            success({ suggestions: [carto], nombre: NombreDeLieux(1) }),
        },
        '12345678900012',
        cinquante,
      ),
    ).toEqual(success({ suggestions: [coop], nombre: 1, sourcesEnPanne: [] }))
  })

  it('se replie sur l’annuaire quand la coop ne connaît pas le SIRET', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLAnnuaireDesEntreprises: async () =>
            success({ suggestions: [annuaire], nombre: NombreDeLieux(3) }),
        },
        '12345678900012',
        cinquante,
      ),
    ).toEqual(
      success({ suggestions: [annuaire], nombre: 3, sourcesEnPanne: [] }),
    )
  })

  it('écarte de la cartographie les lieux que la coop propose déjà', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCoop: async () => ({
            suggestions: [coop],
            nombre: NombreDeLieux(1),
          }),
          chercherDansLaCartographie: async () =>
            success({
              suggestions: [cartoConnueDeLaCoop, carto],
              nombre: NombreDeLieux(2),
            }),
        },
        'Médiathèque',
        cinquante,
      ),
    ).toEqual(
      success({ suggestions: [coop, carto], nombre: 3, sourcesEnPanne: [] }),
    )
  })

  it('n’interroge pas l’annuaire quand la coop ou la cartographie répondent', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCartographie: async () =>
            success({ suggestions: [carto], nombre: NombreDeLieux(1) }),
          chercherDansLAnnuaireDesEntreprises: async () =>
            success({ suggestions: [annuaire], nombre: NombreDeLieux(1) }),
        },
        'Médiathèque',
        cinquante,
      ),
    ).toEqual(success({ suggestions: [carto], nombre: 1, sourcesEnPanne: [] }))
  })

  it('signale une cartographie indisponible sans perdre les lieux de la coop', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCoop: async () => ({
            suggestions: [coop],
            nombre: NombreDeLieux(1),
          }),
          chercherDansLaCartographie: cartographieEnPanne,
        },
        'Médiathèque',
        cinquante,
      ),
    ).toEqual(
      success({
        suggestions: [coop],
        nombre: 1,
        sourcesEnPanne: [SourceExterne('Cartographie')],
      }),
    )
  })

  it('signale un annuaire indisponible quand il était le dernier recours', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLAnnuaireDesEntreprises: annuaireEnPanne,
        },
        'Médiathèque',
        cinquante,
      ),
    ).toEqual(
      success({
        suggestions: [],
        nombre: 0,
        sourcesEnPanne: [SourceExterne('Annuaire')],
      }),
    )
  })

  it('signale les deux sources en panne quand l’annuaire était le dernier recours', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCartographie: cartographieEnPanne,
          chercherDansLAnnuaireDesEntreprises: annuaireEnPanne,
        },
        'Médiathèque',
        cinquante,
      ),
    ).toEqual(
      success({
        suggestions: [],
        nombre: 0,
        sourcesEnPanne: [
          SourceExterne('Cartographie'),
          SourceExterne('Annuaire'),
        ],
      }),
    )
  })

  it('ne retient pas plus de suggestions que la limite', async () => {
    expect(
      await rechercher(
        {
          ...sourcesVides,
          chercherDansLaCoop: async () => ({
            suggestions: [deLaCoop('coop-1'), deLaCoop('coop-2')],
            nombre: NombreDeLieux(2),
          }),
          chercherDansLaCartographie: async () =>
            success({ suggestions: [carto], nombre: NombreDeLieux(1) }),
        },
        'Médiathèque',
        NombreDeLieux(2),
      ),
    ).toEqual(
      success({
        suggestions: [deLaCoop('coop-1'), deLaCoop('coop-2')],
        nombre: 3,
        sourcesEnPanne: [],
      }),
    )
  })
})
