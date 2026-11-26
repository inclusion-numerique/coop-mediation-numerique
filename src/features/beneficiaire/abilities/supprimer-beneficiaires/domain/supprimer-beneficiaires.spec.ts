import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { supprimerBeneficiaires } from './supprimer-beneficiaires'

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const lea = BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f')

const malo = BeneficiaireId('6a1d8b63-2c0f-4d4b-8e3f-8b9c7d6e5f40')

const inconnu = BeneficiaireId('7b2e9c74-3d1a-4e5c-9f40-9c0d8e7f6a51')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

describe('supprimer des bénéficiaires', () => {
  it('compte les seuls bénéficiaires du médiateur qui existent encore', async () => {
    const supprimer = supprimerBeneficiaires({
      beneficiairesExistants: async () => [lea, malo],
      anonymiserLesBeneficiaires: async () => undefined,
    })

    expect(
      await supprimer({ ids: [lea, malo, inconnu], mediateurId, maintenant }),
    ).toEqual({ success: true, data: { deleted: 2 } })
  })

  it('échoue quand aucun bénéficiaire demandé n’existe pour ce médiateur', async () => {
    const supprimer = supprimerBeneficiaires({
      beneficiairesExistants: async () => [],
      anonymiserLesBeneficiaires: async () => undefined,
    })

    expect(
      await supprimer({ ids: [inconnu], mediateurId, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'AucunBeneficiaireValide' } })
  })
})
