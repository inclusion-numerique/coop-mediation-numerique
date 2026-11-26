import { describe, expect, it } from 'vitest'
import { TailleDeLot } from './taille-de-lot'

describe('taille de lot', () => {
  it('refuse une taille nulle', () => {
    expect(TailleDeLot.safe(0)).toBeNull()
  })
})
