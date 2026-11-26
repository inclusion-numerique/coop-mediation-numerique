import { describe, expect, it } from 'vitest'
import { Prenom } from '../../domain/identite/prenom'
import { facultative, lue } from './lue.transfer'

describe('lue', () => {
  it('rend une valeur absente quand la colonne est nulle', () => {
    expect(lue(Prenom, null)).toBeNull()
  })

  it('rend la valeur du domaine quand la colonne est valide', () => {
    expect(lue(Prenom, 'Jeanne')).toBe(Prenom('Jeanne'))
  })

  it('normalise la valeur par le constructeur du domaine', () => {
    expect(lue(Prenom, '  Jeanne  ')).toBe(Prenom('Jeanne'))
  })

  it('rend une valeur absente quand la colonne est invalide pour le domaine', () => {
    expect(lue(Prenom, '   ')).toBeNull()
  })
})

describe('facultative', () => {
  it('rend une valeur absente quand la colonne est nulle', () => {
    expect(facultative(Prenom, null)).toBeNull()
  })

  it('rend la valeur du domaine normalisée quand la colonne est valide', () => {
    expect(facultative(Prenom, '  Jeanne  ')).toBe(Prenom('Jeanne'))
  })

  it('refuse une colonne invalide pour le domaine', () => {
    expect(() => facultative(Prenom, '   ')).toThrow()
  })
})
