import type {
  SourceDeSuggestion,
  SuggestionDeLieu,
} from '../../../domain/suggestion-de-lieu'
import type { RechercherDesLieuxAAjouterPorts } from './ports'
import {
  estUneRechercheParSiret,
  rechercherDesLieuxAAjouter,
} from './rechercher'

const suggestion = (
  id: string,
  source: SourceDeSuggestion,
  structures: { id: string }[] = [],
): SuggestionDeLieu => ({
  id,
  nom: id,
  adresse: '',
  commune: '',
  codePostal: '',
  codeInsee: null,
  complementAdresse: null,
  pivot: undefined,
  typologie: null,
  latitude: null,
  longitude: null,
  structures,
  source,
})

const source = (suggestions: readonly SuggestionDeLieu[], nombre?: number) =>
  jest.fn(async () => ({
    suggestions,
    nombre: nombre ?? suggestions.length,
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

describe('reconnaître une recherche par SIRET', () => {
  it.each([
    ['123456789', true],
    ['123 456 789 00012', true],
    ['12345678', false],
    ['Médiathèque 123456789', false],
  ])('« %s » : %s', (recherche, attendu) => {
    expect(estUneRechercheParSiret(recherche)).toBe(attendu)
  })
})

describe('rechercher des lieux à ajouter', () => {
  it('ne cherche rien en dessous de trois caractères', async () => {
    const coop = source([suggestion('coop', 'structure_locale')])

    const resultat = await rechercherDesLieuxAAjouter(
      ports({ chercherDansLaCoop: coop }),
    )('Mé')

    expect(resultat.structures).toEqual([])
    expect(coop).not.toHaveBeenCalled()
  })

  it('cherche un SIRET dans la coop sans consulter la cartographie', async () => {
    const cartographie = source([])

    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([suggestion('coop', 'structure_locale')]),
        chercherDansLaCartographie: cartographie,
      }),
    )('12345678900012')

    expect(resultat.structures.map(({ id }) => id)).toEqual(['coop'])
    expect(cartographie).not.toHaveBeenCalled()
  })

  it('se replie sur l’annuaire quand la coop ne connaît pas le SIRET', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLAnnuaireDesEntreprises: source(
          [suggestion('api_12345678900012', 'api')],
          3,
        ),
      }),
    )('12345678900012')

    expect(resultat).toEqual({
      structures: [suggestion('api_12345678900012', 'api')],
      matchesCount: 3,
      moreResults: 2,
      apiUnavailable: false,
      cartoUnavailable: false,
    })
  })

  it('écarte de la cartographie les lieux que la coop propose déjà', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([suggestion('coop', 'structure_locale')]),
        chercherDansLaCartographie: source([
          suggestion('carto-connu', 'cartographie_nationale', [{ id: 'x' }]),
          suggestion('carto-inconnu', 'cartographie_nationale'),
        ]),
      }),
    )('Médiathèque')

    expect(resultat.structures.map(({ id }) => id)).toEqual([
      'coop',
      'carto-inconnu',
    ])
  })

  it('n’interroge pas l’annuaire quand la coop ou la cartographie répondent', async () => {
    const annuaire = source([suggestion('api', 'api')])

    await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCartographie: source([
          suggestion('carto', 'cartographie_nationale'),
        ]),
        chercherDansLAnnuaireDesEntreprises: annuaire,
      }),
    )('Médiathèque')

    expect(annuaire).not.toHaveBeenCalled()
  })

  it('signale une cartographie indisponible sans perdre les lieux de la coop', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: source([suggestion('coop', 'structure_locale')]),
        chercherDansLaCartographie: enPanne(),
      }),
    )('Médiathèque')

    expect(resultat.structures.map(({ id }) => id)).toEqual(['coop'])
    expect(resultat.cartoUnavailable).toBe(true)
  })

  it('signale un annuaire indisponible quand il était le dernier recours', async () => {
    const resultat = await rechercherDesLieuxAAjouter(
      ports({ chercherDansLAnnuaireDesEntreprises: enPanne() }),
    )('Médiathèque')

    expect(resultat).toEqual({
      structures: [],
      matchesCount: 0,
      moreResults: 0,
      apiUnavailable: true,
      cartoUnavailable: false,
    })
  })

  it('partage la limite entre la coop et la cartographie pour une recherche par nom', async () => {
    const coop = source([])
    const cartographie = source([])

    await rechercherDesLieuxAAjouter(
      ports({
        chercherDansLaCoop: coop,
        chercherDansLaCartographie: cartographie,
      }),
    )('Médiathèque', { limite: 9, sauf: ['deja-la'] })

    expect(coop).toHaveBeenCalledWith('Médiathèque', 5)
    expect(cartographie).toHaveBeenCalledWith('Médiathèque', {
      limite: 5,
      sauf: ['deja-la'],
    })
  })
})
