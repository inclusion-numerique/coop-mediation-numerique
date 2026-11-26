import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
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
  commune: null,
  communeCodePostal: null,
  communeCodeInsee: null,
  notes: null,
  pasDeTelephone: null,
  anneeNaissance: null,
  rdvServicePublicId: null,
  rdvUserId: null,
  genre: null,
  trancheAge: null,
  statutSocial: null,
  creation: new Date('2025-03-10T08:00:00.000Z'),
}

const marie: BeneficiaireAFusionner = {
  ...vide,
  prenom: 'Marie',
  nom: 'Martin',
  email: 'marie@example.com',
  pasDeTelephone: true,
  anneeNaissance: 1990,
  creation: new Date('2025-01-05T08:00:00.000Z'),
}

const jeanne: BeneficiaireAFusionner = {
  ...vide,
  prenom: 'Jeanne',
  nom: '   ',
  telephone: '+33600000000',
  pasDeTelephone: false,
  anneeNaissance: 0,
  creation: new Date('2025-03-10T08:00:00.000Z'),
}

describe('fusionner des bénéficiaires', () => {
  it('garde les valeurs renseignées de la destination, comble les autres depuis la source et retient la création la plus ancienne', async () => {
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
          prenom: 'Jeanne',
          nom: 'Martin',
          telephone: '+33600000000',
          email: 'marie@example.com',
          pasDeTelephone: false,
          anneeNaissance: 0,
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
