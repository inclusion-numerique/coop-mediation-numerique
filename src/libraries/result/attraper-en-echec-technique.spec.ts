import { describe, expect, it } from 'vitest'
import { attraperEnEchecTechnique } from './attraper-en-echec-technique'

describe('attraper en échec technique', () => {
  it('rend en succès ce que l’effet a produit', async () => {
    expect(
      await attraperEnEchecTechnique(async (nombre: number) => nombre + 1)(41),
    ).toEqual({ success: true, data: 42 })
  })

  it('rend en échec technique l’exception levée par l’effet', async () => {
    expect(
      await attraperEnEchecTechnique(async (_: number) => {
        throw new Error('base indisponible')
      })(41),
    ).toEqual({
      success: false,
      error: { _tag: 'EchecTechnique', cause: 'base indisponible' },
    })
  })
})
