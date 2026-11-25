import { describe, expect, it } from 'vitest'
import { Effectif } from '../../../domain'
import { proportion } from './proportion'

describe('proportion', () => {
  it('arrondit la part de l’ensemble au pourcentage entier le plus proche', () => {
    expect(proportion(Effectif(1), Effectif(3))).toEqual({
      effectif: 1,
      pourcentage: 33,
    })
  })

  it('vaut 0 % d’un ensemble vide', () => {
    expect(proportion(Effectif(0), Effectif(0)).pourcentage).toBe(0)
  })
})
