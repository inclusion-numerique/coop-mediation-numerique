import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { type Departement, NomDepartement } from '@/libraries/departement'
import { CodeDepartement } from '@/libraries/insee'
import type { PageDActeurs } from './acteurs-du-departement'
import type { CriteresActeurs } from './criteres-acteurs'
import { listerLesActeursDuDepartement } from './lister-les-acteurs-du-departement'

const criteres: CriteresActeurs = {
  recherche: Search(''),
  role: null,
  communes: [],
  tri: Sort('nom', 'asc'),
  page: Page(1),
  pageSize: PageSize(20),
}

const aucunActeur: PageDActeurs = {
  items: [],
  totalItems: 0,
  currentPage: Page(1),
  pageSize: PageSize(20),
}

const cantal: Departement = {
  code: CodeDepartement('15'),
  nom: NomDepartement('Cantal'),
}

const lister = listerLesActeursDuDepartement({
  acteursDuDepartement: async () => aucunActeur,
  communesDesLieux: async () => ({
    communesOptions: [{ value: '15014', label: 'Aurillac' }],
  }),
})

describe('lister les acteurs du département', () => {
  it('présente les acteurs du département avec les communes de leurs lieux', async () => {
    expect(await lister({ departement: cantal, criteres })).toEqual({
      success: true,
      data: {
        departement: cantal,
        criteres,
        acteurs: aucunActeur,
        communes: [{ value: '15014', label: 'Aurillac' }],
      },
    })
  })

  it('refuse un département inconnu', async () => {
    expect(await lister({ departement: null, criteres })).toEqual({
      success: false,
      error: { _tag: 'DepartementInconnu' },
    })
  })
})
