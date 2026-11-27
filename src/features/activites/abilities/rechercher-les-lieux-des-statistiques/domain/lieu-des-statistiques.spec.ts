import { describe, expect, it } from 'vitest'
import { GenreDeLieu } from './lieu-des-statistiques'

describe('genre de lieu des statistiques', () => {
  it.each<{ readonly genre: 'LieuDActivite' | 'Commune' | 'Departement' }>([
    { genre: 'LieuDActivite' },
    { genre: 'Commune' },
    { genre: 'Departement' },
  ])('accepte « $genre »', ({ genre }) => {
    expect(GenreDeLieu(genre)).toBe(genre)
  })
})
