import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { BeneficiaireTrouve } from '../../domain/beneficiaires-recherches'
import {
  toBeneficiaireData,
  toPreviewBanData,
} from './option-de-beneficiaire.presenter'

const lyon = CommuneResidence({
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
})

const item = (overrides?: Partial<BeneficiaireTrouve>): BeneficiaireTrouve => ({
  id: BeneficiaireId('00000000-0000-0000-0000-000000000001'),
  prenom: Prenom('Ada'),
  nom: Nom('Lovelace'),
  communeResidence: lyon,
  ...overrides,
})

describe('toPreviewBanData', () => {
  it('projette une commune de résidence en aperçu BAN', () => {
    expect(toPreviewBanData(lyon)).toEqual({
      id: '69381',
      nom: 'Lyon',
      commune: 'Lyon',
      codePostal: '69001',
      codeInsee: '69381',
      label: 'Lyon',
      contexte: '',
      latitude: 0,
      longitude: 0,
    })
  })
})

describe('toBeneficiaireData', () => {
  it('expose les champs de sélection avec sa commune en aperçu BAN', () => {
    expect(toBeneficiaireData(item())).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      prenom: 'Ada',
      nom: 'Lovelace',
      communeResidence: toPreviewBanData(lyon),
    })
  })

  it('met la commune à null en son absence', () => {
    expect(toBeneficiaireData(item({ communeResidence: null }))).toMatchObject({
      communeResidence: null,
    })
  })
})
