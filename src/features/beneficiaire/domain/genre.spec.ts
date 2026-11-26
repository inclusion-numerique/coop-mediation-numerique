import { describe, expect, it } from 'vitest'
import { Genre } from './genre'

describe('Genre', () => {
  it('accepts a provided genre', () => {
    expect(Genre('Feminin')).toBe('Feminin')
  })

  it.each<{ cas: string; valeur: null | undefined }>([
    { cas: 'null', valeur: null },
    { cas: 'undefined', valeur: undefined },
  ])('defaults to NonCommunique when $cas', ({ valeur }) => {
    expect(Genre(valeur)).toBe('NonCommunique')
  })
})
