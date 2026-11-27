import { describe, expect, it } from 'vitest'
import { Telephone } from '@/libraries/telephone'
import { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireAnonyme, BeneficiaireIdentifie } from './beneficiaire'
import {
  beneficiaireAdresseString,
  estAnonyme,
  nomAfficheDepuisLIdentite,
  nomAfficheDuBeneficiaire,
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
import { TrancheAge } from './tranche-age'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const base = {
  id: BeneficiaireId('550e8400-e29b-41d4-a716-446655440000'),
  mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440001'),
  genre: Genre('NonCommunique'),
  trancheAge: TrancheAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  creation: maintenant,
  modification: maintenant,
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

describe('estAnonyme', () => {
  it('returns true for anonymous beneficiaire', () => {
    expect(estAnonyme(anonyme)).toBe(true)
  })

  it('returns false for identified beneficiaire', () => {
    expect(estAnonyme(identifie)).toBe(false)
  })
})

describe('nomAfficheDuBeneficiaire', () => {
  it('returns "Bénéficiaire anonyme" for anonymous', () => {
    expect(nomAfficheDuBeneficiaire(anonyme)).toBe('Bénéficiaire anonyme')
  })

  it('returns full name for identified', () => {
    expect(nomAfficheDuBeneficiaire(identifie)).toBe('Jean Dupont')
  })
})

describe('nomAfficheDepuisLIdentite', () => {
  it.each<{
    cas: string
    identite: { prenom?: string | null; nom?: string | null }
    attendu: string
  }>([
    {
      cas: 'joins prénom and nom',
      identite: { prenom: 'Jean', nom: 'Dupont' },
      attendu: 'Jean Dupont',
    },
    {
      cas: 'falls back to "Bénéficiaire anonyme" when both are null',
      identite: { prenom: null, nom: null },
      attendu: 'Bénéficiaire anonyme',
    },
    {
      cas: 'falls back to "Bénéficiaire anonyme" when both are missing',
      identite: {},
      attendu: 'Bénéficiaire anonyme',
    },
    {
      cas: 'keeps the nom alone',
      identite: { prenom: null, nom: 'Dupont' },
      attendu: 'Dupont',
    },
    {
      cas: 'keeps the prénom alone',
      identite: { prenom: 'Jean', nom: null },
      attendu: 'Jean',
    },
  ])('$cas', ({ identite, attendu }) => {
    expect(nomAfficheDepuisLIdentite(identite)).toBe(attendu)
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
    expect(AnneeNaissance(maintenant).safe(1899)).toBeNull()
  })

  it('rejects year after the current one', () => {
    expect(AnneeNaissance(maintenant).safe(2027)).toBeNull()
  })

  it('accepts the current year', () => {
    expect(AnneeNaissance(maintenant)(2026)).toBe(2026)
  })
})

describe('toBeneficiaireIdentifie', () => {
  const id = BeneficiaireId('550e8400-e29b-41d4-a716-446655440000')
  const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440001')
  const creation = new Date('2024-01-01T10:00:00.000Z')
  const modification = new Date('2024-02-01T10:00:00.000Z')
  const anneeNaissance = AnneeNaissance(modification)

  const minimal: Parameters<typeof toBeneficiaireIdentifie>[0] = {
    prenom: Prenom('Jean'),
    nom: Nom('Dupont'),
    contactTelephone: { _tag: 'nonRenseigne' },
    email: null,
    anneeNaissance: null,
    communeResidence: null,
    genre: Genre('NonCommunique'),
    trancheAge: TrancheAge('NonCommunique'),
    statutSocial: StatutSocial('NonCommunique'),
    notes: null,
  }

  it('builds an identified, non-suppressed beneficiaire', () => {
    expect(
      toBeneficiaireIdentifie(
        {
          ...minimal,
          contactTelephone: {
            _tag: 'disponible',
            numero: Telephone('0102030405'),
          },
          email: Email('jean.dupont@example.com'),
        },
        { id, mediateurId, creation, modification },
      ),
    ).toEqual<BeneficiaireIdentifie>({
      id,
      mediateurId,
      anonyme: false,
      prenom: Prenom('Jean'),
      nom: Nom('Dupont'),
      contactTelephone: {
        _tag: 'disponible',
        numero: Telephone('0102030405'),
      },
      email: Email('jean.dupont@example.com'),
      anneeNaissance: null,
      communeResidence: null,
      notes: null,
      genre: Genre('NonCommunique'),
      statutSocial: StatutSocial('NonCommunique'),
      trancheAge: TrancheAge('NonCommunique'),
      creation,
      modification,
      suppression: null,
    })
  })

  it('keeps the trancheAge saisie when anneeNaissance is absent', () => {
    expect(
      toBeneficiaireIdentifie(
        { ...minimal, trancheAge: TrancheAge('SoixanteDixPlus') },
        { id, mediateurId, creation, modification },
      ).trancheAge,
    ).toBe('SoixanteDixPlus')
  })

  it.each<{ annee: number; tranche: TrancheAge }>([
    { annee: 2019, tranche: TrancheAge('MoinsDeDouze') },
    { annee: 2012, tranche: TrancheAge('DouzeDixHuit') },
    { annee: 2004, tranche: TrancheAge('DixHuitVingtQuatre') },
    { annee: 1994, tranche: TrancheAge('VingtCinqTrenteNeuf') },
    { annee: 1974, tranche: TrancheAge('QuaranteCinquanteNeuf') },
    { annee: 1959, tranche: TrancheAge('SoixanteSoixanteNeuf') },
    { annee: 1949, tranche: TrancheAge('SoixanteDixPlus') },
  ])(
    'derives the tranche $tranche from the année $annee at the modification, over the saisie',
    ({ annee, tranche }) => {
      expect(
        toBeneficiaireIdentifie(
          {
            ...minimal,
            anneeNaissance: anneeNaissance(annee),
            trancheAge: TrancheAge('NonCommunique'),
          },
          { id, mediateurId, creation, modification },
        ).trancheAge,
      ).toBe(tranche)
    },
  )
})
