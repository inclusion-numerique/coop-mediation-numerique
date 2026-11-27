import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { Telephone } from '@/libraries/telephone'
import type { BeneficiaireAFusionner } from './beneficiaire-a-fusionner'
import { fusionnerBeneficiaires } from './fusionner-beneficiaires'

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const sourceId = BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f')

const destinationId = BeneficiaireId('6a1d8b63-2c0f-4d4b-8e3f-8b9c7d6e5f40')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const vide: BeneficiaireAFusionner = {
  prenom: null,
  nom: null,
  telephone: null,
  email: null,
  adresse: null,
  communeResidence: null,
  notes: null,
  pasDeTelephone: null,
  anneeNaissance: null,
  rdvServicePublicId: null,
  rdvUserId: null,
  genre: Genre('NonCommunique'),
  trancheAge: TrancheAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  creation: new Date('2025-03-10T08:00:00.000Z'),
}

const marie: BeneficiaireAFusionner = {
  ...vide,
  prenom: Prenom('Marie'),
  nom: Nom('Martin'),
  email: Email('marie@example.com'),
  adresse: '3 rue de la République',
  communeResidence: CommuneResidence({
    commune: 'Lyon',
    codePostal: '69002',
    codeInsee: '69382',
  }),
  genre: Genre('Feminin'),
  pasDeTelephone: true,
  anneeNaissance: AnneeNaissance(maintenant)(1990),
  creation: new Date('2025-01-05T08:00:00.000Z'),
}

const jeanne: BeneficiaireAFusionner = {
  ...vide,
  prenom: Prenom('Jeanne'),
  telephone: Telephone('+33600000000'),
  adresse: '   ',
  pasDeTelephone: false,
  creation: new Date('2025-03-10T08:00:00.000Z'),
}

describe('fusionner des bénéficiaires', () => {
  it('garde les valeurs renseignées de la destination, comble les autres (non communiquées comprises) depuis la source et retient la création la plus ancienne', async () => {
    expect(
      await fusionnerBeneficiaires({
        lireLesBeneficiairesAFusionner: async () => ({
          source: marie,
          destination: jeanne,
        }),
        enregistrerLaFusion: async () => undefined,
      })({ sourceId, destinationId, mediateurId, maintenant }),
    ).toEqual({
      success: true,
      data: {
        sourceId,
        destinationId,
        mediateurId,
        donneesDeLaDestination: {
          prenom: Prenom('Jeanne'),
          nom: Nom('Martin'),
          telephone: Telephone('+33600000000'),
          email: Email('marie@example.com'),
          adresse: '3 rue de la République',
          communeResidence: CommuneResidence({
            commune: 'Lyon',
            codePostal: '69002',
            codeInsee: '69382',
          }),
          genre: Genre('Feminin'),
          pasDeTelephone: false,
          anneeNaissance: AnneeNaissance(maintenant)(1990),
        },
        creation: new Date('2025-01-05T08:00:00.000Z'),
        maintenant,
      },
    })
  })

  it('garde la création de la destination quand elle est la plus ancienne', async () => {
    expect(
      await fusionnerBeneficiaires({
        lireLesBeneficiairesAFusionner: async () => ({
          source: jeanne,
          destination: marie,
        }),
        enregistrerLaFusion: async () => undefined,
      })({ sourceId, destinationId, mediateurId, maintenant }),
    ).toMatchObject({
      data: { creation: new Date('2025-01-05T08:00:00.000Z') },
    })
  })

  it('échoue quand la source est introuvable pour ce médiateur', async () => {
    expect(
      await fusionnerBeneficiaires({
        lireLesBeneficiairesAFusionner: async () => ({
          source: null,
          destination: jeanne,
        }),
        enregistrerLaFusion: async () => undefined,
      })({ sourceId, destinationId, mediateurId, maintenant }),
    ).toEqual({
      success: false,
      error: { _tag: 'BeneficiaireSourceIntrouvable', id: sourceId },
    })
  })

  it('échoue quand la destination est introuvable pour ce médiateur', async () => {
    expect(
      await fusionnerBeneficiaires({
        lireLesBeneficiairesAFusionner: async () => ({
          source: jeanne,
          destination: null,
        }),
        enregistrerLaFusion: async () => undefined,
      })({ sourceId, destinationId, mediateurId, maintenant }),
    ).toEqual({
      success: false,
      error: { _tag: 'BeneficiaireDestinationIntrouvable', id: destinationId },
    })
  })
})
