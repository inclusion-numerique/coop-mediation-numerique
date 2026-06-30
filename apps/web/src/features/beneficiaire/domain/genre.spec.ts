import { Genre } from './genre'

describe('Genre', () => {
  it('accepts a provided genre', () => {
    expect(Genre('Feminin')).toBe('Feminin')
  })

  it('defaults to NonCommunique when absent', () => {
    expect(Genre(null)).toBe('NonCommunique')
    expect(Genre(undefined)).toBe('NonCommunique')
  })
})
