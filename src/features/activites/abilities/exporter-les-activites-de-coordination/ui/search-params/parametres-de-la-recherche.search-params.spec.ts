import { describe, expect, it } from 'vitest'
import { parametresDeLaRecherche } from './parametres-de-la-recherche.search-params'

describe('paramètres de la recherche', () => {
  it("garde les paramètres de l'export et oublie les autres", () => {
    expect(
      parametresDeLaRecherche(
        new URLSearchParams('du=2026-01-01&types=Animation&page=2'),
      ),
    ).toStrictEqual({
      du: '2026-01-01',
      au: undefined,
      types: 'Animation',
      tags: undefined,
    })
  })

  it('retient la première valeur d’un paramètre répété', () => {
    expect(
      parametresDeLaRecherche(new URLSearchParams('tags=a&tags=b')).tags,
    ).toBe('a')
  })
})
