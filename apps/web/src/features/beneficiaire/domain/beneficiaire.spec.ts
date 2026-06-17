import { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireAnonyme, BeneficiaireIdentifie } from './beneficiaire'
import {
  beneficiaireAdresseString,
  beneficiaireDisplayName,
  isBeneficiaireAnonymous,
  toBeneficiaireIdentifie,
} from './beneficiaire'
import { BeneficiaireId } from './beneficiaire-id'
import { CommuneResidence } from './commune-residence'
import { Email } from './email'
import { Genre } from './genre'
import { MediateurId } from './mediateur-id'
import { Nom } from './nom'
import { Prenom } from './prenom'
import { StatutSocial } from './statut-social'
import { Telephone } from './telephone'
import {
  TrancheAge,
  trancheAgeForBeneficiaire,
  trancheAgeFromAnneeNaissance,
} from './tranche-age'

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

describe('beneficiaireDisplayName', () => {
  it('returns "Bénéficiaire anonyme" for anonymous', () => {
    expect(beneficiaireDisplayName(anonyme)).toBe('Bénéficiaire anonyme')
  })

  it('returns full name for identified', () => {
    expect(beneficiaireDisplayName(identifie)).toBe('Jean Dupont')
  })
})

describe('beneficiaireAdresseString', () => {
  it('returns undefined when no commune residence', () => {
    expect(beneficiaireAdresseString(identifie)).toBeUndefined()
  })

  it('returns full address with adresse and commune', () => {
    expect(
      beneficiaireAdresseString({
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
      beneficiaireAdresseString({
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

describe('trancheAgeForBeneficiaire', () => {
  it('returns NonCommunique without année de naissance', () => {
    expect(trancheAgeForBeneficiaire(null)).toBe('NonCommunique')
  })

  it('derives the tranche from the année de naissance', () => {
    const currentYear = new Date().getFullYear()
    expect(trancheAgeForBeneficiaire(AnneeNaissance(currentYear - 30))).toBe(
      'VingtCinqTrenteNeuf',
    )
  })
})

describe('toBeneficiaireIdentifie', () => {
  const id = BeneficiaireId('550e8400-e29b-41d4-a716-446655440000')
  const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440001')
  const creation = new Date('2024-01-01T10:00:00.000Z')
  const modification = new Date('2024-02-01T10:00:00.000Z')

  const minimal = {
    prenom: Prenom('Jean'),
    nom: Nom('Dupont'),
    contactTelephone: { _tag: 'nonRenseigne' },
    email: null,
    anneeNaissance: null,
    communeResidence: null,
    genre: Genre('NonCommunique'),
    statutSocial: StatutSocial('NonCommunique'),
    notes: null,
  } satisfies Parameters<typeof toBeneficiaireIdentifie>[0]

  it('builds an identified, non-suppressed beneficiaire', () => {
    expect(
      toBeneficiaireIdentifie(minimal, {
        id,
        mediateurId,
        creation,
        modification,
      }),
    ).toMatchObject({
      id,
      mediateurId,
      anonyme: false,
      prenom: 'Jean',
      nom: 'Dupont',
      trancheAge: 'NonCommunique',
      creation,
      modification,
      suppression: null,
    })
  })

  it('derives trancheAge from anneeNaissance', () => {
    const currentYear = new Date().getFullYear()
    expect(
      toBeneficiaireIdentifie(
        { ...minimal, anneeNaissance: AnneeNaissance(currentYear - 5) },
        { id, mediateurId, creation, modification },
      ).trancheAge,
    ).toBe('MoinsDeDouze')
  })

  it('preserves the structured value objects', () => {
    const beneficiaire = toBeneficiaireIdentifie(
      {
        ...minimal,
        contactTelephone: {
          _tag: 'disponible',
          numero: Telephone('0102030405'),
        },
        email: Email('jean.dupont@example.com'),
      },
      { id, mediateurId, creation, modification },
    )

    expect(beneficiaire.contactTelephone).toEqual({
      _tag: 'disponible',
      numero: '+33102030405',
    })
    expect(beneficiaire.email).toBe('jean.dupont@example.com')
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
