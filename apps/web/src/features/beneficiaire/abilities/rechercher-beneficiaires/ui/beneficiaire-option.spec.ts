import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { BeneficiaireSearchItem } from '../domain/rechercher-beneficiaires'
import { toBeneficiaireData, toPreviewBanData } from './beneficiaire-option'

const lyon = CommuneResidence({
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
})

const item = (
  overrides?: Partial<BeneficiaireSearchItem>,
): BeneficiaireSearchItem => ({
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
