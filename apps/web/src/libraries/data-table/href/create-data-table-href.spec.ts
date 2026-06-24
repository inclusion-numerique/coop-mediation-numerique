import { createDataTableHref } from './create-data-table-href'

describe('createDataTableHref', () => {
  it('serializes the state into the query string', () => {
    expect(
      createDataTableHref('/base', { tri: 'nom', ordre: 'asc', page: '2' }),
    ).toBe('/base?tri=nom&ordre=asc&page=2')
  })

  it('omits empty values', () => {
    expect(
      createDataTableHref('/base', {
        recherche: '',
        tri: undefined,
        page: '1',
      }),
    ).toBe('/base?page=1')
  })

  it('returns a bare base with a trailing question mark when state is empty', () => {
    expect(createDataTableHref('/base', {})).toBe('/base?')
  })
})
