import { describe, expect, it } from 'vitest'
import { TypeDActivite } from '../mediation/type-d-activite'
import { estFiltre } from './criteres-des-activites'
import { CRITERES_VIDES } from './criteres-vides'

describe('critères des activités', () => {
  it('ne filtrent rien quand ils sont vides', () => {
    expect(estFiltre(CRITERES_VIDES)).toBe(false)
  })

  it('filtrent dès qu’une liste est choisie', () => {
    expect(
      estFiltre({ ...CRITERES_VIDES, types: [TypeDActivite('Collectif')] }),
    ).toBe(true)
  })

  it('filtrent dès qu’une période est choisie', () => {
    expect(
      estFiltre({
        ...CRITERES_VIDES,
        periode: { du: new Date('2026-01-01'), au: new Date('2026-01-31') },
      }),
    ).toBe(true)
  })
})
