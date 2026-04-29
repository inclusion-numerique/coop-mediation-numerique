import {
  getBeneficiaireAdresseString,
  getBeneficiaireDisplayName,
  isBeneficiaireAnonymous,
} from './beneficiaire'
import { trancheAgeFromAnneeNaissance } from './tranche-age'

describe('isBeneficiaireAnonymous', () => {
  it('returns true when prenom and nom are null', () => {
    expect(isBeneficiaireAnonymous({ prenom: null, nom: null })).toBe(true)
  })

  it('returns false when prenom is set', () => {
    expect(isBeneficiaireAnonymous({ prenom: 'Jean', nom: null })).toBe(false)
  })

  it('returns false when nom is set', () => {
    expect(isBeneficiaireAnonymous({ prenom: null, nom: 'Dupont' })).toBe(false)
  })
})

describe('getBeneficiaireDisplayName', () => {
  it('returns "Bénéficiaire anonyme" when no name', () => {
    expect(getBeneficiaireDisplayName({ prenom: null, nom: null })).toBe(
      'Bénéficiaire anonyme',
    )
  })

  it('returns full name', () => {
    expect(
      getBeneficiaireDisplayName({ prenom: 'Jean', nom: 'Dupont' }),
    ).toBe('Jean Dupont')
  })

  it('returns prenom only', () => {
    expect(getBeneficiaireDisplayName({ prenom: 'Jean', nom: null })).toBe(
      'Jean',
    )
  })

  it('returns nom only', () => {
    expect(getBeneficiaireDisplayName({ prenom: null, nom: 'Dupont' })).toBe(
      'Dupont',
    )
  })
})

describe('getBeneficiaireAdresseString', () => {
  it('returns undefined when no data', () => {
    expect(
      getBeneficiaireAdresseString({
        adresse: null,
        commune: null,
        communeCodePostal: null,
      }),
    ).toBeUndefined()
  })

  it('returns adresse only when no commune', () => {
    expect(
      getBeneficiaireAdresseString({
        adresse: '12 rue de la Paix',
        commune: null,
        communeCodePostal: null,
      }),
    ).toBe('12 rue de la Paix')
  })

  it('returns full address', () => {
    expect(
      getBeneficiaireAdresseString({
        adresse: '12 rue de la Paix',
        commune: 'Paris',
        communeCodePostal: '75001',
      }),
    ).toBe('12 rue de la Paix, 75001 Paris')
  })

  it('returns commune without adresse', () => {
    expect(
      getBeneficiaireAdresseString({
        adresse: null,
        commune: 'Lyon',
        communeCodePostal: '69001',
      }),
    ).toBe('69001 Lyon')
  })
})

describe('trancheAgeFromAnneeNaissance', () => {
  const currentYear = new Date().getFullYear()

  it('returns null for null input', () => {
    expect(trancheAgeFromAnneeNaissance(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(trancheAgeFromAnneeNaissance(undefined)).toBeNull()
  })

  it('returns null for year before 1900', () => {
    expect(trancheAgeFromAnneeNaissance(1899)).toBeNull()
  })

  it('returns null for year in the future', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear + 1)).toBeNull()
  })

  it('returns MoinsDeDouze for child under 12', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 5)).toBe('MoinsDeDouze')
  })

  it('returns DouzeDixHuit for teenager', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 15)).toBe('DouzeDixHuit')
  })

  it('returns DixHuitVingtQuatre for young adult', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 20)).toBe(
      'DixHuitVingtQuatre',
    )
  })

  it('returns VingtCinqTrenteNeuf for adult', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 30)).toBe(
      'VingtCinqTrenteNeuf',
    )
  })

  it('returns QuaranteCinquanteNeuf for middle-aged', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 50)).toBe(
      'QuaranteCinquanteNeuf',
    )
  })

  it('returns SoixanteSoixanteNeuf for senior', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 65)).toBe(
      'SoixanteSoixanteNeuf',
    )
  })

  it('returns SoixanteDixPlus for elderly', () => {
    expect(trancheAgeFromAnneeNaissance(currentYear - 75)).toBe(
      'SoixanteDixPlus',
    )
  })

  it('handles string input', () => {
    expect(trancheAgeFromAnneeNaissance(String(currentYear - 30))).toBe(
      'VingtCinqTrenteNeuf',
    )
  })
})
