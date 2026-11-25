import { describe, expect, it } from 'vitest'
import { cumulsSuccessifs } from './cumuls-successifs'

const ajouter = (cumul: number, valeur: number): number => cumul + valeur

describe('cumuls successifs', () => {
  it('commence par le départ et ajoute chaque élément au cumul précédent', () => {
    expect(cumulsSuccessifs(10, [1, 2, 3], ajouter)).toEqual([10, 11, 13, 16])
  })

  it('se limite au départ sans élément', () => {
    expect(cumulsSuccessifs(10, [], ajouter)).toEqual([10])
  })
})
