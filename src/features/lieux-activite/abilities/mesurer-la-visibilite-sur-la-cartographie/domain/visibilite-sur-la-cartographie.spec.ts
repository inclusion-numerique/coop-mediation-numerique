import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
import { VisibiliteDuLieu } from './visibilite-du-lieu'
import {
  departementDeReference,
  lieuxVisibles,
} from './visibilite-sur-la-cartographie'

const lieuVisibleARochefort = {
  codeInsee: CodeInsee('17299'),
  visibilite: VisibiliteDuLieu('Visible'),
}

const lieuMasqueARochefort = {
  codeInsee: CodeInsee('17299'),
  visibilite: VisibiliteDuLieu('Masque'),
}

const lieuVisibleSansCommune = {
  codeInsee: null,
  visibilite: VisibiliteDuLieu('Visible'),
}

describe('departementDeReference', () => {
  it('prend le département de l’employeuse avant celui des lieux', () => {
    expect(
      departementDeReference({
        employeuse: CodeInsee('69123'),
        lieux: [lieuVisibleARochefort],
      }),
    ).toBe('69')
  })

  it('prend le département du premier lieu situé sans employeuse', () => {
    expect(
      departementDeReference({
        employeuse: null,
        lieux: [lieuVisibleSansCommune, lieuMasqueARochefort],
      }),
    ).toBe('17')
  })

  it('se rabat sur le département par défaut sans territoire connu', () => {
    expect(departementDeReference({ employeuse: null, lieux: [] })).toBe('75')
  })
})

describe('lieuxVisibles', () => {
  it('ne compte que les lieux visibles', () => {
    expect(lieuxVisibles([lieuVisibleARochefort, lieuMasqueARochefort])).toBe(1)
  })
})
