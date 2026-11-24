import { describe, expect, it } from 'vitest'
import {
  listeChoisie,
  listeEnParametres,
  periodeEnParametres,
  sansLaValeurDesFiltres,
} from './filtres-des-coordinations.search-params'

describe('filtres des coordinations', () => {
  it('lit une liste choisie', () => {
    expect(
      listeChoisie(new URLSearchParams('tags=a,,b'), 'tags'),
    ).toStrictEqual(['a', 'b'])
  })

  it('lit une liste absente comme vide', () => {
    expect(listeChoisie(new URLSearchParams(''), 'types')).toStrictEqual([])
  })

  it('écrit une liste', () => {
    expect(listeEnParametres('types', ['animation'])).toStrictEqual({
      types: 'animation',
    })
  })

  it('écrit une période', () => {
    expect(
      periodeEnParametres(new Date('2026-03-01'), new Date('2026-03-31')),
    ).toStrictEqual({ du: '2026-03-01', au: '2026-03-31' })
  })

  it('retire la période', () => {
    expect(periodeEnParametres()).toStrictEqual({ du: null, au: null })
  })

  it("retire une valeur de chaque paramètre d'un filtre", () => {
    expect(
      sansLaValeurDesFiltres(new URLSearchParams('tags=a,b'), ['tags'], 'a'),
    ).toStrictEqual({ tags: 'b' })
  })

  it('retire les paramètres d’un filtre sans valeur', () => {
    expect(
      sansLaValeurDesFiltres(new URLSearchParams('du=1&au=2'), ['du', 'au']),
    ).toStrictEqual({ du: null, au: null })
  })
})
