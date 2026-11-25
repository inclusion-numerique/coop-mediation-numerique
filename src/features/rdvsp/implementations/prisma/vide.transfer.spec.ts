import { describe, expect, it } from 'vitest'
import { absentSiVide } from './vide.transfer'

describe('absentSiVide', () => {
  it('garde une valeur absente absente', () => {
    expect(absentSiVide(null)).toBeNull()
  })

  it('ramène une chaîne vide à une valeur absente', () => {
    expect(absentSiVide('')).toBeNull()
  })

  it('ramène une chaîne faite d’espaces à une valeur absente', () => {
    expect(absentSiVide('  \t ')).toBeNull()
  })

  it('garde une valeur renseignée telle quelle', () => {
    expect(absentSiVide('0612345678')).toBe('0612345678')
  })

  it('ne retire pas les espaces autour d’une valeur renseignée', () => {
    expect(absentSiVide(' jeton ')).toBe(' jeton ')
  })
})
