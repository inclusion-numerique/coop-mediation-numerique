import { describe, expect, it } from 'vitest'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import {
  DEPARTEMENT_PAR_DEFAUT,
  departementConnu,
  departementDuCode,
  departementsDesCodesInsee,
} from './departement'
import { departementDeLActeur } from './departement-de-l-acteur'

describe('département', () => {
  it('trouve un département du référentiel', () => {
    expect(departementDuCode('15')).toEqual({
      success: true,
      data: { code: '15', nom: 'Cantal' },
    })
  })

  it.each(['20', 'ZZ'])('ne trouve pas le département %s', (code) => {
    expect(departementDuCode(code)).toEqual({
      success: false,
      error: { _tag: 'DepartementInconnu', code },
    })
  })

  it.each(['20', 'ZZ'])('ne connaît pas le département %s', (code) => {
    expect(departementConnu(code)).toBeNull()
  })

  it('déduit les départements des codes INSEE, sans doublon', () => {
    expect(departementsDesCodesInsee(['69123', '69381', '2A004'])).toEqual([
      { code: '69', nom: 'Rhône' },
      { code: '2A', nom: 'Corse-du-Sud' },
    ])
  })

  it('garde les trois chiffres des départements et collectivités d’outre-mer', () => {
    expect(departementsDesCodesInsee(['97411', '98818'])).toEqual([
      { code: '974', nom: 'La Réunion' },
      { code: '988', nom: 'Nouvelle-Calédonie' },
    ])
  })

  it('écarte les codes INSEE invalides', () => {
    expect(departementsDesCodesInsee(['abc', '69123'])).toEqual([
      { code: '69', nom: 'Rhône' },
    ])
  })

  it('a Paris pour département par défaut', () => {
    expect(DEPARTEMENT_PAR_DEFAUT).toBe(CodeDepartement('75'))
  })
})

describe('département de l’acteur', () => {
  it('préfère le département de l’employeuse', () => {
    expect(
      departementDeLActeur({
        employeuse: CodeInsee('15014'),
        lieux: [CodeInsee('69123')],
      }),
    ).toBe('15')
  })

  it('se replie sur le premier lieu d’activité', () => {
    expect(
      departementDeLActeur({
        employeuse: null,
        lieux: [CodeInsee('97411'), CodeInsee('69123')],
      }),
    ).toBe('974')
  })

  it('n’a pas de département sans employeuse ni lieu', () => {
    expect(departementDeLActeur({ employeuse: null, lieux: [] })).toBeNull()
  })
})
