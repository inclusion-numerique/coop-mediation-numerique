import { describe, expect, it } from 'vitest'
import { typologieStructureLibelle } from './typologie-de-structure'

describe('typologie de structure', () => {
  it('se présente sous le libellé du formulaire de lieu', () => {
    expect(typologieStructureLibelle('CCAS')).toBe(
      'Centres communaux d’action sociale (CCAS)',
    )
  })
})
