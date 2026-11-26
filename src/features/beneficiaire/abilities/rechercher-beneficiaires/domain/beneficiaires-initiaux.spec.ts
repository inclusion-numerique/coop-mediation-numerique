import { describe, expect, it } from 'vitest'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { beneficiairesInitiaux } from './beneficiaires-initiaux'
import type { BeneficiairesRecherches } from './beneficiaires-recherches'

const proposes: BeneficiairesRecherches = { beneficiaires: [], totalCount: 3 }

const proposer = async () => proposes

describe('beneficiairesInitiaux', () => {
  it('ne propose aucun bénéficiaire sans médiateur', async () => {
    expect(
      await beneficiairesInitiaux(proposer)({
        mediateurId: null,
        includeBeneficiaireIds: [],
      }),
    ).toStrictEqual({ beneficiaires: [], totalCount: 0 })
  })

  it('propose les bénéficiaires du médiateur', async () => {
    expect(
      await beneficiairesInitiaux(proposer)({
        mediateurId: MediateurId('0f6c5f43-3c8e-4a8a-9d3a-6f1a2b3c4d5e'),
        includeBeneficiaireIds: [],
      }),
    ).toBe(proposes)
  })
})
