import { CodeDepartement } from './code-departement'
import { CodeInsee } from './code-insee'
import { DEPARTEMENT_PAR_DEFAUT, departementDuCode } from './departement'
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
