import { describe, expect, it } from 'vitest'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { fusionnerDesLieux } from './fusionner-des-lieux'

const source = LieuId('550e8400-e29b-41d4-a716-446655440000')
const cible = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const fusionner = async () => undefined

describe('fusionner des lieux', () => {
  it('refuse la fusion quand le lieu à absorber est introuvable', async () => {
    expect(
      await fusionnerDesLieux({ lieuxExistants: async () => [], fusionner })({
        source,
        cible,
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'LieuIntrouvable', lieuId: source },
    })
  })

  it('refuse la fusion quand le lieu à conserver est introuvable', async () => {
    expect(
      await fusionnerDesLieux({
        lieuxExistants: async () => [source],
        fusionner,
      })({ source, cible }),
    ).toEqual({
      success: false,
      error: { _tag: 'LieuIntrouvable', lieuId: cible },
    })
  })

  it('fusionne deux lieux existants', async () => {
    expect(
      await fusionnerDesLieux({
        lieuxExistants: async () => [source, cible],
        fusionner,
      })({ source, cible }),
    ).toEqual({ success: true, data: undefined })
  })
})
