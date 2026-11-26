import { describe, expect, it } from 'vitest'
import { departements } from './departements'
import {
  correspondALaRecherche,
  rechercherDesDepartements,
} from './recherche-de-departements'

const rhone = { code: '69', nom: 'Rhône' }

describe('recherche de départements', () => {
  it('trouve un département par le début de son code', () => {
    expect(correspondALaRecherche('6')(rhone)).toBe(true)
  })

  it('ne trouve pas un département par la fin de son code', () => {
    expect(correspondALaRecherche('9')(rhone)).toBe(false)
  })

  it('trouve un département corse par son code en minuscules', () => {
    expect(rechercherDesDepartements('2a')).toStrictEqual([
      { code: '2A', nom: 'Corse-du-Sud' },
    ])
  })

  it('trouve un département par son nom sans accent', () => {
    expect(correspondALaRecherche('rhone')(rhone)).toBe(true)
  })

  it('trouve un département composé saisi avec des espaces', () => {
    expect(rechercherDesDepartements('seine saint denis')).toStrictEqual([
      { code: '93', nom: 'Seine-Saint-Denis' },
    ])
  })

  it('trouve un département à apostrophe saisi sans apostrophe', () => {
    expect(rechercherDesDepartements('cotes d armor')).toStrictEqual([
      { code: '22', nom: "Côtes-d'Armor" },
    ])
  })

  it('rend tout le référentiel pour une recherche vide', () => {
    expect(rechercherDesDepartements('  ')).toStrictEqual(departements)
  })

  it('ne rend rien pour une recherche sans correspondance', () => {
    expect(rechercherDesDepartements('zzz')).toStrictEqual([])
  })
})
