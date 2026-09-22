import { valeursAReprendre } from './valeurs-a-reprendre'

const telleQuelle = (valeur: string) => [valeur]

const refuseLesVides = (valeur: string) => (valeur === '' ? [] : [valeur])

describe('la reprise d’une liste de valeurs', () => {
  it('ne reproche rien à une liste déjà rangée', () => {
    expect(
      valeursAReprendre(['a@exemple.fr', 'b@exemple.fr'], telleQuelle),
    ).toBeNull()
  })

  it('range une liste que rien d’autre ne touche', () => {
    expect(
      valeursAReprendre(['b@exemple.fr', 'a@exemple.fr'], telleQuelle),
    ).toEqual({
      conservees: ['a@exemple.fr', 'b@exemple.fr'],
      perdues: [],
    })
  })

  it('ôte une valeur répétée', () => {
    expect(
      valeursAReprendre(['a@exemple.fr', 'a@exemple.fr'], telleQuelle),
    ).toEqual({ conservees: ['a@exemple.fr'], perdues: [] })
  })

  it('range selon la collation française et non selon les points de code', () => {
    expect(valeursAReprendre(['Étudiants', 'Femmes'], telleQuelle)).toBeNull()
  })

  it('range ce qui reste après avoir perdu la valeur fautive', () => {
    expect(
      valeursAReprendre(['b@exemple.fr', '', 'a@exemple.fr'], refuseLesVides),
    ).toEqual({
      conservees: ['a@exemple.fr', 'b@exemple.fr'],
      perdues: [''],
    })
  })
})
