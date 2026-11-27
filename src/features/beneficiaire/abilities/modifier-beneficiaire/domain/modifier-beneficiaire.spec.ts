import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { BeneficiaireAModifier } from './beneficiaire-a-modifier'
import { modifierBeneficiaire } from './modifier-beneficiaire'

const id = BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const creation = new Date('2025-03-10T08:00:00.000Z')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const beneficiaire: BeneficiaireAModifier = {
  id,
  prenom: Prenom('Léa'),
  nom: Nom('Martin'),
  contactTelephone: { _tag: 'nonRenseigne' },
  email: null,
  anneeNaissance: null,
  communeResidence: null,
  genre: Genre('Feminin'),
  trancheAge: TrancheAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  notes: null,
}

describe('modifier un bénéficiaire', () => {
  it('rend le bénéficiaire modifié, qui garde sa date de création', async () => {
    const modifier = modifierBeneficiaire({
      creationDuBeneficiaire: async () => creation,
      enregistrerLaModification: async () => undefined,
    })

    expect(await modifier({ beneficiaire, mediateurId, maintenant })).toEqual({
      success: true,
      data: {
        ...beneficiaire,
        mediateurId,
        anonyme: false,
        creation,
        modification: maintenant,
        suppression: null,
      },
    })
  })

  it('échoue sur un bénéficiaire introuvable pour ce médiateur', async () => {
    const modifier = modifierBeneficiaire({
      creationDuBeneficiaire: async () => null,
      enregistrerLaModification: async () => undefined,
    })

    expect(await modifier({ beneficiaire, mediateurId, maintenant })).toEqual({
      success: false,
      error: { _tag: 'BeneficiaireNotFound', id },
    })
  })
})
