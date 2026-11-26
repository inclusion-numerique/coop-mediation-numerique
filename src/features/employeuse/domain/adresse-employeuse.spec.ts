import { describe, expect, it } from 'vitest'
import type { Model } from '@/libraries/model'
import { AdresseEmployeuse } from './adresse-employeuse'

type AdresseSoumise = Model.InputOf<typeof AdresseEmployeuse>

const adresseComplete: AdresseSoumise = {
  voie: '12 rue des Tests',
  codePostal: '44000',
  codeInsee: '44109',
  commune: 'Nantes',
}

describe('AdresseEmployeuse', () => {
  it('accepte une adresse complète', () => {
    expect(AdresseEmployeuse(adresseComplete)).toEqual({
      voie: '12 rue des Tests',
      codePostal: '44000',
      codeInsee: '44109',
      commune: 'Nantes',
    })
  })

  it('tolère l’absence de voie, seule partie qui peut manquer dans main.adresse', () => {
    expect(AdresseEmployeuse({ ...adresseComplete, voie: null })).toEqual({
      voie: null,
      codePostal: '44000',
      codeInsee: '44109',
      commune: 'Nantes',
    })
  })

  describe('code postal', () => {
    it.each<{ cas: string; codePostal: string }>([
      { cas: 'quatre chiffres', codePostal: '4400' },
      { cas: 'six chiffres', codePostal: '440000' },
      { cas: 'une lettre', codePostal: '4400A' },
      { cas: 'une chaîne vide', codePostal: '' },
    ])('exige 5 chiffres et écarte $cas', ({ codePostal }) => {
      expect(
        AdresseEmployeuse.safe({ ...adresseComplete, codePostal }),
      ).toBeNull()
    })

    it('accepte les DOM, dont les codes 97xxx et 98xxx ont 5 chiffres', () => {
      expect(
        AdresseEmployeuse({ ...adresseComplete, codePostal: '97400' }),
      ).toEqual({ ...adresseComplete, codePostal: '97400' })
    })

    it('normalise les espaces, y compris imbriqué dans l’adresse', () => {
      expect(
        AdresseEmployeuse({ ...adresseComplete, codePostal: ' 44 000 ' }),
      ).toEqual(adresseComplete)
    })

    it('fait tomber l’adresse entière, code INSEE compris, quand le code postal est hors format', () => {
      expect(
        AdresseEmployeuse.safe({
          ...adresseComplete,
          codePostal: 'pas-un-code',
        }),
      ).toBeNull()
    })
  })

  describe('code INSEE', () => {
    it('accepte la Corse', () => {
      expect(
        AdresseEmployeuse({ ...adresseComplete, codeInsee: '2A004' }),
      ).toEqual({ ...adresseComplete, codeInsee: '2A004' })
    })

    it('normalise la casse de la Corse, y compris imbriqué dans l’adresse', () => {
      expect(
        AdresseEmployeuse({ ...adresseComplete, codeInsee: '2a004' }),
      ).toEqual({ ...adresseComplete, codeInsee: '2A004' })
    })

    it('écarte un code hors format', () => {
      expect(
        AdresseEmployeuse.safe({ ...adresseComplete, codeInsee: '441' }),
      ).toBeNull()
    })
  })

  it('exige une commune', () => {
    expect(
      AdresseEmployeuse.safe({ ...adresseComplete, commune: '' }),
    ).toBeNull()
  })
})
