import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import {
  type AdresseGeocodee,
  adresseAReprendre,
  adresseSoumise,
  voieMuette,
} from './adresse-a-reprendre'

const RENDUE: AdresseGeocodee = {
  type: 'housenumber',
  score: 0.96,
  banId: '51454_7160_00012',
  voie: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  latitude: 49.25,
  longitude: 4.03,
  libelle: '12 rue de la Paix 51100 Reims',
}

const verdict = (
  rendue?: Partial<AdresseGeocodee>,
  lieu: Parameters<typeof lieuAReprendre>[0] = {},
) =>
  adresseAReprendre(
    lieuAReprendre(lieu),
    rendue === undefined ? undefined : { ...RENDUE, ...rendue },
  )

describe('le verdict sur l’adresse d’un lieu', () => {
  it('ne reproche rien à une adresse que la BAN rend à l’identique', () => {
    expect(verdict({})).toBeNull()
  })

  it('corrige une adresse dont l’identifiant BAN diffère', () => {
    expect(verdict({ banId: '51454_7160_00099' })).toEqual({
      verdict: 'a-corriger',
      adresse: { ...RENDUE, banId: '51454_7160_00099' },
    })
  })

  it('corrige une adresse dépourvue de coordonnées', () => {
    expect(verdict({}, { latitude: null, longitude: null })?.verdict).toBe(
      'a-corriger',
    )
  })

  it('ne corrige pas un repli sur le centre de la commune', () => {
    expect(verdict({ type: 'municipality' })).toEqual({
      verdict: 'a-verifier',
      motif: 'la voie est introuvable',
    })
  })

  it('ne corrige pas un lieu-dit', () => {
    expect(verdict({ type: 'locality' })?.verdict).toBe('a-verifier')
  })

  it('ne corrige pas une voie trouvée dans une autre commune', () => {
    expect(verdict({ codeInsee: '51108' })).toEqual({
      verdict: 'a-verifier',
      motif: 'une autre commune que celle enregistrée',
    })
  })

  it('ne corrige pas un appariement faible', () => {
    expect(verdict({ score: 0.899 })).toEqual({
      verdict: 'a-verifier',
      motif: 'score insuffisant',
    })
  })

  it('retient un appariement tout juste au seuil', () => {
    expect(verdict({ score: 0.9, banId: 'autre' })?.verdict).toBe('a-corriger')
  })

  it('signale une adresse dont la BAN ne rend rien', () => {
    expect(verdict(undefined)).toEqual({
      verdict: 'a-verifier',
      motif: 'la Base Adresse Nationale ne rend rien',
    })
  })
})

describe('la voie soumise à la Base Adresse Nationale', () => {
  it.each([
    [
      'ce qui précède le type de voie',
      'Hotel de Ville 7 Rue Andre Gide',
      '7 Rue Andre Gide',
    ],
    [
      'la zone d’activité',
      'ZA STANG AR GARRONT 9 RUE CAMILLE DANGUILLAUME',
      '9 RUE CAMILLE DANGUILLAUME',
    ],
    [
      'la lettre isolée après le numéro',
      '5 T RUE JEAN COTTIN',
      '5 RUE JEAN COTTIN',
    ],
    [
      'le second numéro de la fourchette',
      '39-41 Rue de l’Esterel',
      '39 Rue de l’Esterel',
    ],
    ['la boîte postale', 'BP 117 2 Avenue du Parc', '2 Avenue du Parc'],
  ])('se débarrasse de %s', (_cas, brute, attendue) => {
    expect(adresseSoumise(lieuAReprendre({ adresse: brute })).voie).toBe(
      attendue,
    )
  })

  it('laisse intacte une voie qui n’a rien de trop', () => {
    expect(
      adresseSoumise(lieuAReprendre({ adresse: '12 rue de la Paix' })).voie,
    ).toBe('12 rue de la Paix')
  })
})

const RETROUVEE = { ...RENDUE, distance: 0 }

const parLesCoordonnees = (
  retrouvee?: Partial<typeof RETROUVEE>,
  lieu: Parameters<typeof lieuAReprendre>[0] = {},
) =>
  adresseAReprendre(
    lieuAReprendre({ adresse: 'Vallon-en-Sully', ...lieu }),
    { ...RENDUE, type: 'municipality' },
    retrouvee === undefined ? undefined : { ...RETROUVEE, ...retrouvee },
  )

describe('l’adresse retrouvée au point du lieu', () => {
  it('rattrape une voie que la Base Adresse Nationale ne reconnaît pas', () => {
    expect(parLesCoordonnees({ banId: 'autre' })).toEqual({
      verdict: 'a-corriger',
      adresse: { ...RETROUVEE, banId: 'autre' },
    })
  })

  it('accepte un point tout juste à la limite', () => {
    expect(parLesCoordonnees({ distance: 20, banId: 'autre' })?.verdict).toBe(
      'a-corriger',
    )
  })

  it('refuse un point trop éloigné de l’adresse rendue', () => {
    expect(parLesCoordonnees({ distance: 21 })).toEqual({
      verdict: 'a-verifier',
      motif: 'la voie est introuvable',
    })
  })

  it('refuse une adresse trouvée dans une autre commune', () => {
    expect(parLesCoordonnees({ codeInsee: '51108' })?.verdict).toBe(
      'a-verifier',
    )
  })

  it('refuse un repli sur le centre de la commune', () => {
    expect(parLesCoordonnees({ type: 'municipality' })?.verdict).toBe(
      'a-verifier',
    )
  })

  it('ne sert pas quand l’adresse écrite suffit', () => {
    expect(
      adresseAReprendre(lieuAReprendre(), RENDUE, {
        ...RETROUVEE,
        banId: 'ailleurs',
      }),
    ).toBeNull()
  })

  it('ne concerne pas un lieu sans coordonnées', () => {
    expect(parLesCoordonnees(undefined)?.verdict).toBe('a-verifier')
  })
})

describe('la voie qui se tait, seule à laisser parler le point', () => {
  it.each([
    ['une voie vide', ''],
    ['une voie réduite à des blancs', '   '],
    ['le nom de la commune', 'Reims'],
    ['un lieu-dit sans type de voie', 'Metairie Loaven'],
    ['un nom de bâtiment', 'Maison De Pays'],
  ])('se tait quand elle porte %s', (_cas, adresse) => {
    expect(voieMuette(lieuAReprendre({ adresse }))).toBe(true)
  })

  it.each([
    ['une rue', '12 rue de la Paix'],
    ['un boulevard en capitales', '45 BOULEVARD DE STRASBOURG'],
    ['un chemin sans numéro', 'Chemin Abel Labonne'],
    ['une place abrégée', "1 PL D'ARMES"],
  ])('parle quand elle porte %s', (_cas, adresse) => {
    expect(voieMuette(lieuAReprendre({ adresse }))).toBe(false)
  })

  it('ne laisse pas le point remplacer une voie qui parle', () => {
    expect(
      adresseAReprendre(
        lieuAReprendre({ adresse: 'Route de Marseille' }),
        { ...RENDUE, type: 'municipality' },
        { ...RENDUE, voie: 'Route de Lyon', banId: 'autre', distance: 3 },
      ),
    ).toEqual({ verdict: 'a-verifier', motif: 'la voie est introuvable' })
  })
})
