import { describe, expect, it } from 'vitest'
import { TypeContrat } from './type-contrat'

describe('type de contrat', () => {
  it.each<string>(['CDD', 'CDI', 'CDP', 'PEC'])('reconnaît %s', (type) => {
    expect(TypeContrat(type)).toBe(type)
  })

  it('tient un type absent pour non communiqué', () => {
    expect(TypeContrat(null)).toBe('NonCommunique')
  })

  it('refuse un type inconnu', () => {
    expect(TypeContrat.safe('XYZ')).toBeNull()
  })
})
