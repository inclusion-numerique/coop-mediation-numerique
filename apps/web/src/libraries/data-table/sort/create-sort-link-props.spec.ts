import { createSortLinkProps } from './create-sort-link-props'

describe('createSortLinkProps', () => {
  it('marks the column matching the current tri as active and toggles its direction', () => {
    expect(
      createSortLinkProps({
        baseHref: '/base',
        state: { tri: 'nom', ordre: 'asc' },
        tri: 'nom',
      }),
    ).toMatchObject({ isActive: true, ordre: 'desc' })
  })

  it('proposes asc for a non-active column', () => {
    expect(
      createSortLinkProps({
        baseHref: '/base',
        state: { tri: 'nom', ordre: 'asc' },
        tri: 'prenom',
      }),
    ).toMatchObject({ isActive: false, ordre: 'asc' })
  })

  it('treats the default column as active and proposes the opposite of its default direction when the URL carries no tri', () => {
    expect(
      createSortLinkProps({
        baseHref: '/base',
        state: {},
        tri: 'nom',
        isDefault: true,
        defaultDirection: 'asc',
      }),
    ).toMatchObject({ isActive: true, ordre: 'desc' })
  })

  it('builds an href carrying the proposed direction', () => {
    expect(
      createSortLinkProps({
        baseHref: '/base',
        state: { page: '2' },
        tri: 'prenom',
      }).href,
    ).toBe('/base?page=2&tri=prenom&ordre=asc')
  })
})
