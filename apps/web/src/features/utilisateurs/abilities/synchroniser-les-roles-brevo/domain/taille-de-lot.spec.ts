import { enLots, TailleDeLot } from './taille-de-lot'

describe('découpage en lots', () => {
  it('ne dépasse jamais la taille maximale', () => {
    expect(enLots([1, 2, 3, 4, 5], TailleDeLot(2))).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ])
  })

  it('ne produit aucun lot sans élément', () => {
    expect(enLots([], TailleDeLot(2))).toEqual([])
  })

  it('refuse une taille nulle', () => {
    expect(TailleDeLot.safe(0)).toBeNull()
  })
})
