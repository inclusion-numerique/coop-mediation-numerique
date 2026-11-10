import { Nom, Siret } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../domain/lieu-id'
import { NombreDeLieux } from '../../../domain/nombres'
import { SourceExterne } from '../../../domain/source-externe'
import {
  AdresseLibre,
  type ProvenanceDeSuggestion,
  type SuggestionDeLieu,
} from '../../../domain/suggestion-de-lieu'
import type { RechercherDesLieuxAAjouterPorts } from './ports'
import { RechercheDeLieu } from './recherche-de-lieu'
import { rechercherDesLieuxAAjouter } from './rechercher'

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

const deLaCarto = (nom: string, lieuCoop: LieuId | null = null) =>
  suggestion(nom, {
    _tag: 'Cartographie',
    identifiant: IdentifiantCartographie(nom),
    lieuCoop,
  })

const deLAnnuaire = (nom: string) =>
  suggestion(nom, { _tag: 'Annuaire', siret: Siret('13002603200016') })

const source = (suggestions: readonly SuggestionDeLieu[], nombre?: number) =>
  jest.fn(async () => ({
    suggestions,
    nombre: NombreDeLieux(nombre ?? suggestions.length),
  }))

const enPanne = () =>
  jest.fn(async () => {
    throw new Error('indisponible')
  })

const ports = (
  partie: Partial<RechercherDesLieuxAAjouterPorts> = {},
): RechercherDesLieuxAAjouterPorts => ({
  chercherDansLaCoop: source([]),
  chercherDansLaCartographie: source([]),
  chercherDansLAnnuaireDesEntreprises: source([]),
  ...partie,
})

const noms = ({ suggestions }: { suggestions: readonly SuggestionDeLieu[] }) =>
  suggestions.map(({ nom }) => nom)

describe('lire une recherche de lieu', () => {
  it.each([
    ['Mé', { _tag: 'TropCourte' }],
    ['  Mé  ', { _tag: 'TropCourte' }],
    ['123456789', { _tag: 'ParNumeroDEntreprise', terme: '123456789' }],
    [
      '123 456 789 00012',
      { _tag: 'ParNumeroDEntreprise', terme: '12345678900012' },
    ],
    ['12345678', { _tag: 'ParNom', terme: '12345678' }],
    [
      'Médiathèque 123456789',
      { _tag: 'ParNom', terme: 'Médiathèque 123456789' },
    ],
  ])('« %s »', (texte, attendu) => {
    expect(RechercheDeLieu(texte)).toEqual(attendu)
  })
})

describe('rechercher des lieux à ajouter', () => {
  it('ne cherche rien en dessous de trois caractères', async () => {
    const coop = source([deLaCoop('coop')])

    const resultat = await rechercherDesLieuxAAjouter(
      ports({ chercherDansLaCoop: coop }),
    )(RechercheDeLieu('Mé'))

    expect(resultat.suggestions).toEqual([])
    expect(coop).not.toHaveBeenCalled()
  })

  it('cherche un SIRET dans la coop sans consulter la cartographie', async () => {
    const cartographie = source([])

    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([deLaCoop('coop')]),
        chercherDansLaCartographie: cartographie,
      }),
    )(RechercheDeLieu('12345678900012'))

    expect(noms(resultat)).toEqual(['coop'])
    expect(cartographie).not.toHaveBeenCalled()
  })

  it('se replie sur l’annuaire quand la coop ne connaît pas le SIRET', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLAnnuaireDesEntreprises: source([deLAnnuaire('api')], 3),
      }),
    )(RechercheDeLieu('12345678900012'))

    expect(resultat).toEqual({
      suggestions: [deLAnnuaire('api')],
      nombre: 3,
      sourcesEnPanne: [],
    })
  })

  it('écarte de la cartographie les lieux que la coop propose déjà', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([deLaCoop('coop')]),
        chercherDansLaCartographie: source([
          deLaCarto('carto-connu', LIEU_COOP),
          deLaCarto('carto-inconnu'),
        ]),
      }),
    )(RechercheDeLieu('Médiathèque'))

    expect(noms(resultat)).toEqual(['coop', 'carto-inconnu'])
  })

  it('n’interroge pas l’annuaire quand la coop ou la cartographie répondent', async () => {
    const annuaire = source([deLAnnuaire('api')])

    await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCartographie: source([deLaCarto('carto')]),
        chercherDansLAnnuaireDesEntreprises: annuaire,
      }),
    )(RechercheDeLieu('Médiathèque'))

    expect(annuaire).not.toHaveBeenCalled()
  })

  it('signale une cartographie indisponible sans perdre les lieux de la coop', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([deLaCoop('coop')]),
        chercherDansLaCartographie: enPanne(),
      }),
    )(RechercheDeLieu('Médiathèque'))

    expect(noms(resultat)).toEqual(['coop'])
    expect(resultat.sourcesEnPanne).toEqual([SourceExterne('Cartographie')])
  })

  it('signale un annuaire indisponible quand il était le dernier recours', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({ chercherDansLAnnuaireDesEntreprises: enPanne() }),
    )(RechercheDeLieu('Médiathèque'))

    expect(resultat).toEqual({
      suggestions: [],
      nombre: 0,
      sourcesEnPanne: [SourceExterne('Annuaire')],
    })
  })

  it('cherche un numéro d’entreprise sans ses espaces', async () => {
    const coop = source([])
    const annuaire = source([])

    await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: coop,
        chercherDansLAnnuaireDesEntreprises: annuaire,
      }),
    )(RechercheDeLieu('123 456 789 00012'))

    expect(coop).toHaveBeenCalledWith('12345678900012', 50)
    expect(annuaire).toHaveBeenCalledWith('12345678900012')
  })

  it('signale les deux sources en panne quand l’annuaire était le dernier recours', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCartographie: enPanne(),
        chercherDansLAnnuaireDesEntreprises: enPanne(),
      }),
    )(RechercheDeLieu('Médiathèque'))

    expect(resultat.sourcesEnPanne).toEqual([
      SourceExterne('Cartographie'),
      SourceExterne('Annuaire'),
    ])
  })

  it('ne retient pas plus de suggestions que la limite', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([deLaCoop('coop-1'), deLaCoop('coop-2')]),
        chercherDansLaCartographie: source([deLaCarto('carto')]),
      }),
    )(RechercheDeLieu('Médiathèque'), { limite: NombreDeLieux(2) })

    expect(noms(resultat)).toEqual(['coop-1', 'coop-2'])
  })

  it('partage la limite entre la coop et la cartographie pour une recherche par nom', async () => {
    const coop = source([])
    const cartographie = source([])

    await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: coop,
        chercherDansLaCartographie: cartographie,
      }),
    )(RechercheDeLieu('Médiathèque'), {
      limite: NombreDeLieux(9),
      sauf: [IdentifiantCartographie('deja-la')],
    })

    expect(coop).toHaveBeenCalledWith('Médiathèque', 5)
    expect(cartographie).toHaveBeenCalledWith('Médiathèque', {
      limite: 5,
      sauf: ['deja-la'],
    })
  })
})
