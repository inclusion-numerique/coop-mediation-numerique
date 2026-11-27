import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { type Departement, NomDepartement } from '@/libraries/departement'
import { CodeDepartement } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { DepartementInconnu } from '../../../domain'
import { consulterLesLieuxDuDepartement } from './consulter-les-lieux-du-departement'
import type { CriteresDesLieux } from './criteres-des-lieux'

const criteres: CriteresDesLieux = {
  recherche: Search(''),
  communes: [],
  tri: Sort('nom', 'asc'),
  page: Page(1),
  pageSize: PageSize(20),
}

const cantal: Departement = {
  code: CodeDepartement('15'),
  nom: NomDepartement('Cantal'),
}

const consulter = consulterLesLieuxDuDepartement({
  lieuxDuDepartement: async () => ['Médiathèque de Saint-Flour'],
  communesDesLieux: async () => [{ value: '15187', label: 'Saint-Flour' }],
})

describe('consulter les lieux du département', () => {
  it('présente les lieux du département avec les communes où ils se trouvent', async () => {
    expect(await consulter({ departement: cantal, criteres })).toEqual(
      success({
        departement: cantal,
        criteres,
        lieux: ['Médiathèque de Saint-Flour'],
        communes: [{ value: '15187', label: 'Saint-Flour' }],
      }),
    )
  })

  it('refuse un département inconnu', async () => {
    expect(await consulter({ departement: null, criteres })).toEqual(
      failure(DepartementInconnu()),
    )
  })
})
