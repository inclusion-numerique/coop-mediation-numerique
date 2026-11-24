import { describe, expect, it } from 'vitest'
import { Prenom } from '../../domain/identite/prenom'
import { lue } from './lue.transfer'

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
