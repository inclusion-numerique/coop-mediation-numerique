import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import {
  type BeneficiaireAFusionner,
  fusionnerBeneficiaires,
} from './fusionner-beneficiaires'

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const sourceId = BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f')

const destinationId = BeneficiaireId('6a1d8b63-2c0f-4d4b-8e3f-8b9c7d6e5f40')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const jean: BeneficiaireAFusionner = {
  prenom: 'Jean',
  nom: 'Dupont',
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

describe('fusionner des bénéficiaires', () => {
  it('rend la destination comme bénéficiaire fusionné', async () => {
    const fusionner = fusionnerBeneficiaires({
      lireLesBeneficiairesAFusionner: async () => ({
        source: jean,
        destination: jean,
      }),
      enregistrerLaFusion: async () => undefined,
    })

    expect(
      await fusionner({ sourceId, destinationId, mediateurId, maintenant }),
    ).toEqual({
      success: true,
      data: { beneficiaireFusionneId: destinationId },
    })
  })

  it('échoue quand la source est introuvable pour ce médiateur', async () => {
    const fusionner = fusionnerBeneficiaires({
      lireLesBeneficiairesAFusionner: async () => ({
        source: null,
        destination: jean,
      }),
      enregistrerLaFusion: async () => undefined,
    })

    expect(
      await fusionner({ sourceId, destinationId, mediateurId, maintenant }),
    ).toEqual({
      success: false,
      error: { _tag: 'BeneficiaireSourceIntrouvable', id: sourceId },
    })
  })

  it('échoue quand la destination est introuvable pour ce médiateur', async () => {
    const fusionner = fusionnerBeneficiaires({
      lireLesBeneficiairesAFusionner: async () => ({
        source: jean,
        destination: null,
      }),
      enregistrerLaFusion: async () => undefined,
    })

    expect(
      await fusionner({ sourceId, destinationId, mediateurId, maintenant }),
    ).toEqual({
      success: false,
      error: { _tag: 'BeneficiaireDestinationIntrouvable', id: destinationId },
    })
  })
})
