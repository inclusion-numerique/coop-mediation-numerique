import { CodeInsee } from '@app/web/libraries/departement'
import { VisibiliteDuLieu } from './visibilite-du-lieu'
import {
  departementDeReference,
  lieuxVisibles,
} from './visibilite-sur-la-cartographie'

const lieu = (codeInsee: string | null, visible: boolean) => ({
  codeInsee: codeInsee === null ? null : CodeInsee(codeInsee),
  visibilite: VisibiliteDuLieu(visible ? 'Visible' : 'Masque'),
})

describe('departementDeReference', () => {
  it('prend le département de l’employeuse avant celui des lieux', () => {
    expect(
      departementDeReference({
        employeuse: CodeInsee('69123'),
        lieux: [lieu('17299', true)],
      }),
    ).toBe('69')
  })

  it('prend le département du premier lieu situé sans employeuse', () => {
    expect(
      departementDeReference({
        employeuse: null,
        lieux: [lieu(null, true), lieu('17299', false)],
      }),
    ).toBe('17')
  })

  it('se rabat sur le département par défaut sans territoire connu', () => {
    expect(departementDeReference({ employeuse: null, lieux: [] })).toBe('75')
  })
})

describe('lieuxVisibles', () => {
  it('ne compte que les lieux visibles', () => {
    expect(lieuxVisibles([lieu('17299', true), lieu('17299', false)])).toBe(1)
  })
})
