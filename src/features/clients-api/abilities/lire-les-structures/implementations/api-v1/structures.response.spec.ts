import { describe, expect, it } from 'vitest'
import { requeteDesStructures } from './structures.response'

describe('requête des structures', () => {
  it('est vide sans filtre', () => {
    expect(
      requeteDesStructures({
        ids: [],
        creationDepuis: undefined,
        modificationDepuis: undefined,
      }),
    ).toBe('')
  })

  it('reporte les identifiants et les filtres de date', () => {
    expect(
      requeteDesStructures({
        ids: ['a', 'b'],
        creationDepuis: '2025-09-01T00:00:00Z',
        modificationDepuis: undefined,
      }),
    ).toBe(
      'ids=a%2Cb&filter%5Bcreation%5D%5Bdepuis%5D=2025-09-01T00%3A00%3A00Z',
    )
  })
})
