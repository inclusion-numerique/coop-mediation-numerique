import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { type AdresseGeocodee, adresseAReprendre } from './adresse-a-reprendre'

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
