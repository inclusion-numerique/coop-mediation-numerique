import type { BeneficiaireListItem } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { Page, PageSize, type Paginated } from '@arckit/resultset'
import { aBeneficiaireListItem } from './beneficiaire-list-item.fixture'
import { presentMesBeneficiaires } from './lister-beneficiaires.presenter'

const paginated = (
  items: BeneficiaireListItem[],
  totalItems: number,
  page = 1,
  pageSize = 20,
): Paginated<BeneficiaireListItem> => ({
  items,
  totalItems,
  currentPage: Page(page),
  pageSize: PageSize(pageSize),
})

describe('presentMesBeneficiaires', () => {
  it('is empty when there is nothing and no search', () => {
    expect(presentMesBeneficiaires(paginated([], 0))).toEqual({ tag: 'empty' })
  })

  it('is noResults when a search yields nothing', () => {
    expect(presentMesBeneficiaires(paginated([], 0), 'jean')).toEqual({
      tag: 'noResults',
      recherche: 'jean',
    })
  })

  it('projects items to flat rows', () => {
    const view = presentMesBeneficiaires(
      paginated([aBeneficiaireListItem({ prenom: 'Ada', nom: 'Lovelace' })], 1),
    )
    expect(view.tag).toBe('results')
    if (view.tag !== 'results') return
    expect(view.rows[0]).toMatchObject({
      prenom: 'Ada',
      nom: 'Lovelace',
      label: 'Ada Lovelace',
    })
  })

  it('computes pagination metadata', () => {
    const view = presentMesBeneficiaires(
      paginated([aBeneficiaireListItem()], 45, 2, 20),
    )
    if (view.tag !== 'results') throw new Error('expected results')
    expect(view.pagination).toEqual({
      currentPage: 2,
      pageSize: 20,
      totalItems: 45,
      totalPages: 3,
      hasMultiplePages: true,
    })
  })
})
