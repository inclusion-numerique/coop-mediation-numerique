import { AnneeNaissance } from '../domain/annee-naissance'
import type {
  BeneficiaireAnonyme,
  BeneficiaireIdentifie,
} from '../domain/beneficiaire'
import { BeneficiaireId } from '../domain/beneficiaire-id'
import { CommuneResidence } from '../domain/commune-residence'
import { Email } from '../domain/email'
import { Genre } from '../domain/genre'
import { MediateurId } from '../domain/mediateur-id'
import { Nom } from '../domain/nom'
import { Notes } from '../domain/notes'
import { Prenom } from '../domain/prenom'
import { StatutSocial } from '../domain/statut-social'
import { Telephone } from '../domain/telephone'
import { TrancheAge } from '../domain/tranche-age'
import {
  beneficiaireFromDomain,
  beneficiaireToDomain,
} from './beneficiaire.transfer'

const now = new Date('2026-04-29T10:00:00Z')

describe('beneficiaire transfer layer', () => {
  it('round-trips a minimal anonymous beneficiaire', () => {
    const anonyme: BeneficiaireAnonyme = {
      id: BeneficiaireId('550e8400-e29b-41d4-a716-446655440000'),
      mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440001'),
      genre: Genre('NonCommunique'),
      trancheAge: TrancheAge('NonCommunique'),
      statutSocial: StatutSocial('NonCommunique'),
      creation: now,
      modification: now,
      suppression: null,
      anonyme: true,
    }

    const prismaRow = {
      ...beneficiaireFromDomain(anonyme),
      creation: now,
      modification: now,
      suppression: null,
      v1Imported: null,
      rdvServicePublicId: null,
      rdvUserId: null,
      attributionsAleatoires: false,
      import: null,
      accompagnementsCount: 0,
      fusionVersId: null,
    }

    const result = beneficiaireToDomain(prismaRow)

    expect(result).toEqual(anonyme)
  })

  it('round-trips a fully populated identified beneficiaire', () => {
    const identifie: BeneficiaireIdentifie = {
      id: BeneficiaireId('550e8400-e29b-41d4-a716-446655440000'),
      mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440001'),
      genre: Genre('Feminin'),
      trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
      statutSocial: StatutSocial('EnEmploi'),
      creation: now,
      modification: now,
      suppression: null,
      anonyme: false,
      prenom: Prenom('Marie'),
      nom: Nom('Curie'),
      contactTelephone: {
        _tag: 'disponible',
        numero: Telephone('06 12 34 56 78'),
      },
      email: Email('marie@curie.fr'),
      anneeNaissance: AnneeNaissance(1990),
      communeResidence: CommuneResidence({
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '75101',
        adresse: '12 rue de la Paix',
      }),
      notes: Notes('Première visite'),
    }

    const prismaRow = {
      ...beneficiaireFromDomain(identifie),
      creation: now,
      modification: now,
      suppression: null,
      v1Imported: null,
      rdvServicePublicId: null,
      rdvUserId: null,
      attributionsAleatoires: false,
      import: null,
      accompagnementsCount: 0,
      fusionVersId: null,
    }

    const result = beneficiaireToDomain(prismaRow)

    expect(result).toEqual(identifie)
  })
})
