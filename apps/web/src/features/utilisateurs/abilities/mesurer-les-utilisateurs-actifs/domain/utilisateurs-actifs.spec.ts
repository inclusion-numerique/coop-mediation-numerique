import { actifsDeLaCategorie, utilisateursActifs } from './utilisateurs-actifs'

describe('utilisateurs actifs', () => {
  it('calcule la part d’actifs d’une catégorie', () => {
    expect(actifsDeLaCategorie({ actifs: 1, total: 3 })).toEqual({
      value: 1,
      total: 3,
      percentage: 33,
    })
  })

  it('ne divise pas par zéro', () => {
    expect(actifsDeLaCategorie({ actifs: 0, total: 0 }).percentage).toBe(0)
  })

  it('additionne les actifs de toutes les catégories', () => {
    expect(
      utilisateursActifs({
        mediateurs: actifsDeLaCategorie({ actifs: 2, total: 4 }),
        conseillers: actifsDeLaCategorie({ actifs: 3, total: 3 }),
        coordinateurs: actifsDeLaCategorie({ actifs: 1, total: 5 }),
      }).total,
    ).toBe(6)
  })
})
