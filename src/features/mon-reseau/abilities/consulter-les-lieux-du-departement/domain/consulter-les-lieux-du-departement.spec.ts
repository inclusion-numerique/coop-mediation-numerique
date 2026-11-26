import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { DepartementInconnu } from '@/libraries/departement'
import { failure, success } from '@/libraries/result'
import { consulterLesLieuxDuDepartement } from './consulter-les-lieux-du-departement'
import type { CriteresDesLieux } from './criteres-des-lieux'

const criteres: CriteresDesLieux = {
  recherche: Search(''),
  communes: [],
  tri: Sort('nom', 'asc'),
  page: Page(1),
  pageSize: PageSize(20),
}

const ports = {
  lieuxDuDepartement: async () => ['Médiathèque de Saint-Flour'],
  communesDesLieux: async () => ({
    communesOptions: [{ value: '15187', label: 'Saint-Flour' }],
  }),
}

describe('consulter les lieux du département', () => {
  it('présente les lieux du département avec les communes où ils se trouvent', async () => {
    expect(await consulterLesLieuxDuDepartement('15', criteres, ports)).toEqual(
      success({
        departement: { code: '15', nom: 'Cantal' },
        criteres,
        lieux: ['Médiathèque de Saint-Flour'],
        communes: [{ value: '15187', label: 'Saint-Flour' }],
      }),
    )
  })

  it('refuse un département inconnu', async () => {
    expect(await consulterLesLieuxDuDepartement('00', criteres, ports)).toEqual(
      failure(DepartementInconnu('00')),
    )
  })
})
