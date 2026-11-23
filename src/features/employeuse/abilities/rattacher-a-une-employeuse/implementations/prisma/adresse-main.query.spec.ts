import { describe, expect, it } from 'vitest'
import { adresseMainDepuis } from './adresse-main.query'

describe('adresseMainDepuis — codes non conformes des sources amont', () => {
  it('reprend l’adresse de la source quand la BAN ne rend rien', () => {
    const adresse = adresseMainDepuis(
      {
        adresse: '1 rue de la Paix',
        codePostal: '75001',
        codeInsee: '75101',
        commune: 'Paris',
      },
      null,
    )

    expect(adresse).toEqual({
      nomVoie: '1 rue de la Paix',
      codePostal: '75001',
      codeInsee: '75101',
      nomCommune: 'Paris',
      codeBan: null,
      longitude: null,
      latitude: null,
      banScore: null,
      source: 'api-entreprise',
    })
  })

  it('vide le code postal `[NON-DIFFUSIBLE]` en conservant commune et code INSEE', () => {
    const adresse = adresseMainDepuis(
      {
        adresse: '[NON-DIFFUSIBLE]',
        codePostal: '[NON-DIFFUSIBLE]',
        codeInsee: '31024',
        commune: 'Auragne',
      },
      null,
    )

    expect([adresse.codePostal, adresse.codeInsee, adresse.nomCommune]).toEqual(
      ['', '31024', 'Auragne'],
    )
  })

  it('normalise un code postal espacé et un code INSEE corse en minuscules', () => {
    const adresse = adresseMainDepuis(
      {
        adresse: '1 rue du Test',
        codePostal: '20 000',
        codeInsee: '2a004',
        commune: 'AJACCIO',
      },
      null,
    )

    expect([adresse.codePostal, adresse.codeInsee]).toEqual(['20000', '2A004'])
  })
})
