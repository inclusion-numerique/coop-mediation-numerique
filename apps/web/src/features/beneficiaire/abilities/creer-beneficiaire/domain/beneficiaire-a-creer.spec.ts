import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import {
  type BeneficiaireACreer,
  toBeneficiaireIdentifie,
  trancheAgeForBeneficiaire,
} from './beneficiaire-a-creer'

const id = BeneficiaireId('550e8400-e29b-41d4-a716-446655440000')
const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440001')
const creation = new Date('2024-01-01T10:00:00.000Z')
const modification = new Date('2024-02-01T10:00:00.000Z')

const minimal: BeneficiaireACreer = {
  prenom: Prenom('Jean'),
  nom: Nom('Dupont'),
  contactTelephone: { _tag: 'nonRenseigne' },
  email: null,
  anneeNaissance: null,
  communeResidence: null,
  genre: Genre('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  notes: null,
}

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
  it('builds an identified, non-suppressed beneficiaire', () => {
    const beneficiaire = toBeneficiaireIdentifie(minimal, {
      id,
      mediateurId,
      creation,
      modification,
    })

    expect(beneficiaire).toMatchObject({
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
    const beneficiaire = toBeneficiaireIdentifie(
      { ...minimal, anneeNaissance: AnneeNaissance(currentYear - 5) },
      { id, mediateurId, creation, modification },
    )

    expect(beneficiaire.trancheAge).toBe('MoinsDeDouze')
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
      numero: '0102030405',
    })
    expect(beneficiaire.email).toBe('jean.dupont@example.com')
  })
})
