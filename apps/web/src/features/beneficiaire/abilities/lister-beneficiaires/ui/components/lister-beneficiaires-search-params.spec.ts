import {
  DEFAULT_PAGE_SIZE,
  toListerBeneficiairesQuery,
} from './lister-beneficiaires-search-params'

describe('toListerBeneficiairesQuery', () => {
  it('defaults to page 1 and the default page size with no params', () => {
    const query = toListerBeneficiairesQuery({})
    expect(query).toMatchObject({ page: 1, pageSize: DEFAULT_PAGE_SIZE })
    expect(query.search).toBeUndefined()
    expect(query.sort).toBeUndefined()
  })

  it('maps a known sort column and direction', () => {
    expect(
      toListerBeneficiairesQuery({ tri: 'anneeNaissance', ordre: 'desc' }).sort,
    ).toEqual({ field: 'anneeNaissance', direction: 'desc' })
  })

  it('defaults the direction to asc when missing', () => {
    expect(toListerBeneficiairesQuery({ tri: 'nom' }).sort).toEqual({
      field: 'nom',
      direction: 'asc',
    })
  })

  it('ignores an unknown sort column', () => {
    expect(toListerBeneficiairesQuery({ tri: 'inconnu' }).sort).toBeUndefined()
  })

  it('trims the search and drops it when blank', () => {
    expect(toListerBeneficiairesQuery({ recherche: '  jean  ' }).search).toBe(
      'jean',
    )
    expect(
      toListerBeneficiairesQuery({ recherche: '   ' }).search,
    ).toBeUndefined()
  })

  it('parses page and page size, falling back on invalid values', () => {
    expect(
      toListerBeneficiairesQuery({ page: '3', lignes: '50' }),
    ).toMatchObject({ page: 3, pageSize: 50 })
    expect(
      toListerBeneficiairesQuery({ page: '0', lignes: 'abc' }),
    ).toMatchObject({ page: 1, pageSize: DEFAULT_PAGE_SIZE })
  })
})
