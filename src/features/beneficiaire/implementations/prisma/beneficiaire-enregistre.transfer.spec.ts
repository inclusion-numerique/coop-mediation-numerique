import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { Telephone } from '@/libraries/telephone'
import { beneficiaireEnregistreDe } from './beneficiaire-enregistre.transfer'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const ligne = {
  id: '5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f',
  mediateurId: '8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
  prenom: 'Léa',
  nom: 'Martin',
  telephone: '+33102030405',
  email: 'lea@example.fr',
  anneeNaissance: 1996,
  notes: '<p>Rappeler</p>',
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
  genre: Genre('Feminin'),
  trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
  statutSocial: StatutSocial('EnEmploi'),
  adresse: '12 rue de la Paix',
}

const identifiants = {
  id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
  mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
  adresse: '12 rue de la Paix',
}

describe('bénéficiaire enregistré lu en base', () => {
  it('décode chaque champ en value object et garde les autres colonnes', () => {
    expect(beneficiaireEnregistreDe(ligne, maintenant)).toEqual({
      ...identifiants,
      prenom: Prenom('Léa'),
      nom: Nom('Martin'),
      telephone: Telephone('+33102030405'),
      email: Email('lea@example.fr'),
      anneeNaissance: AnneeNaissance(maintenant)(1996),
      notes: Notes('<p>Rappeler</p>'),
      communeResidence: CommuneResidence({
        commune: 'Évreux',
        codePostal: '27000',
        codeInsee: '27229',
      }),
      genre: Genre('Feminin'),
      trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
      statutSocial: StatutSocial('EnEmploi'),
    })
  })

  it('laisse vides les champs absents et tient les énumérations absentes pour non communiquées', () => {
    expect(
      beneficiaireEnregistreDe(
        {
          ...ligne,
          prenom: null,
          nom: null,
          telephone: null,
          email: null,
          anneeNaissance: null,
          notes: null,
          commune: null,
          communeCodePostal: null,
          communeCodeInsee: null,
          genre: null,
          trancheAge: null,
          statutSocial: null,
        },
        maintenant,
      ),
    ).toEqual({
      ...identifiants,
      prenom: null,
      nom: null,
      telephone: null,
      email: null,
      anneeNaissance: null,
      notes: null,
      communeResidence: null,
      genre: Genre('NonCommunique'),
      trancheAge: TrancheAge('NonCommunique'),
      statutSocial: StatutSocial('NonCommunique'),
    })
  })

  it('tient pour absente une commune incomplète', () => {
    expect(
      beneficiaireEnregistreDe({ ...ligne, communeCodeInsee: null }, maintenant)
        .communeResidence,
    ).toBeNull()
  })

  it('tient pour absentes des notes vides', () => {
    expect(
      beneficiaireEnregistreDe({ ...ligne, notes: '   ' }, maintenant).notes,
    ).toBeNull()
  })
})
