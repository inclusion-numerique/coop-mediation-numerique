import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { BeneficiaireAImporter } from './beneficiaire-a-importer'
import { importerBeneficiaires } from './importer-beneficiaires'

const id = BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const beneficiaire: BeneficiaireAImporter = {
  prenom: Prenom('Léa'),
  nom: Nom('Martin'),
  contactTelephone: { _tag: 'nonRenseigne' },
  email: null,
  anneeNaissance: null,
  communeResidence: null,
  genre: Genre('Feminin'),
  trancheAge: TrancheAge('DixHuitVingtQuatre'),
  statutSocial: StatutSocial('NonCommunique'),
  notes: null,
}

describe('importer des bénéficiaires', () => {
  it('enregistre chaque ligne comme un bénéficiaire identifié créé maintenant', async () => {
    expect(
      await importerBeneficiaires({
        enregistrerLesBeneficiairesImportes: async () => undefined,
      })({ lignes: [{ id, beneficiaire }], mediateurId, maintenant }),
    ).toEqual({
      success: true,
      data: {
        beneficiaires: [
          {
            ...beneficiaire,
            id,
            mediateurId,
            anonyme: false,
            creation: maintenant,
            modification: maintenant,
            suppression: null,
          },
        ],
      },
    })
  })
})
