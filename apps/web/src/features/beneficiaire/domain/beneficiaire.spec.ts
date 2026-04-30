import { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireAnonyme, BeneficiaireIdentifie } from './beneficiaire'
import {
  getBeneficiaireAdresseString,
  getBeneficiaireDisplayName,
  isBeneficiaireAnonymous,
} from './beneficiaire'
import { BeneficiaireId } from './beneficiaire-id'
import { CommuneResidence } from './commune-residence'
import { Genre } from './genre'
import { MediateurId } from './mediateur-id'
import { Nom } from './nom'
import { Prenom } from './prenom'
import { StatutSocial } from './statut-social'
import { TrancheAge, trancheAgeFromAnneeNaissance } from './tranche-age'

const base = {
  id: BeneficiaireId('550e8400-e29b-41d4-a716-446655440000'),
  mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440001'),
  genre: Genre('NonCommunique'),
  trancheAge: TrancheAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  creation: new Date(),
  modification: new Date(),
  suppression: null,
}

const anonyme: BeneficiaireAnonyme = { ...base, anonyme: true }

const identifie: BeneficiaireIdentifie = {
  ...base,
  anonyme: false,
  prenom: Prenom('Jean'),
  nom: Nom('Dupont'),
  contactTelephone: { _tag: 'nonRenseigne' },
  email: null,
  anneeNaissance: null,
  communeResidence: null,
  notes: null,
}

describe('isBeneficiaireAnonymous', () => {
  it('returns true for anonymous beneficiaire', () => {
    expect(isBeneficiaireAnonymous(anonyme)).toBe(true)
  })

  it('returns false for identified beneficiaire', () => {
    expect(isBeneficiaireAnonymous(identifie)).toBe(false)
  })
})

describe('getBeneficiaireDisplayName', () => {
  it('returns "Bénéficiaire anonyme" for anonymous', () => {
    expect(getBeneficiaireDisplayName(anonyme)).toBe('Bénéficiaire anonyme')
  })

  it('returns full name for identified', () => {
    expect(getBeneficiaireDisplayName(identifie)).toBe('Jean Dupont')
  })
})

describe('getBeneficiaireAdresseString', () => {
  it('returns undefined when no commune residence', () => {
    expect(getBeneficiaireAdresseString(identifie)).toBeUndefined()
  })

  it('returns full address with adresse and commune', () => {
    expect(
      getBeneficiaireAdresseString({
        ...identifie,
        communeResidence: CommuneResidence({
          commune: 'Paris',
          codePostal: '75001',
          codeInsee: '75101',
          adresse: '12 rue de la Paix',
        }),
      }),
    ).toBe('12 rue de la Paix, 75001 Paris')
  })

  it('returns commune only when no adresse', () => {
    expect(
      getBeneficiaireAdresseString({
        ...identifie,
        communeResidence: CommuneResidence({
          commune: 'Lyon',
          codePostal: '69001',
          codeInsee: '69381',
        }),
      }),
    ).toBe('69001 Lyon')
  })
})

describe('AnneeNaissance', () => {
  it('rejects year before 1900', () => {
    expect(() => AnneeNaissance(1899)).toThrow()
  })

  it('rejects year in the future', () => {
    expect(() => AnneeNaissance(new Date().getFullYear() + 1)).toThrow()
  })

  it('accepts valid year', () => {
    expect(AnneeNaissance(1990)).toBe(1990)
  })
})

describe('trancheAgeFromAnneeNaissance', () => {
  const currentYear = new Date().getFullYear()

  it.each([
    { age: 5, expected: 'MoinsDeDouze' },
    { age: 15, expected: 'DouzeDixHuit' },
    { age: 20, expected: 'DixHuitVingtQuatre' },
    { age: 30, expected: 'VingtCinqTrenteNeuf' },
    { age: 50, expected: 'QuaranteCinquanteNeuf' },
    { age: 65, expected: 'SoixanteSoixanteNeuf' },
    { age: 75, expected: 'SoixanteDixPlus' },
  ])('returns $expected for age $age', ({ age, expected }) => {
    expect(
      trancheAgeFromAnneeNaissance(AnneeNaissance(currentYear - age)),
    ).toBe(expected)
  })
})
