import { describe, expect, it } from 'vitest'
import { finApresDebut } from './periode-de-validite'

describe('période de validité', () => {
  it('refuse une fin qui précède le début', () => {
    expect(
      finApresDebut({
        debut: new Date('2026-06-01'),
        fin: new Date('2026-05-31'),
      }),
    ).toBe(false)
  })

  it('accepte une fin le jour du début', () => {
    expect(
      finApresDebut({
        debut: new Date('2026-06-01'),
        fin: new Date('2026-06-01'),
      }),
    ).toBe(true)
  })

  it('accepte une période sans fin', () => {
    expect(finApresDebut({ debut: new Date('2026-06-01'), fin: null })).toBe(
      true,
    )
  })
})
