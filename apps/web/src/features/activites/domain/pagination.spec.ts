import { paginationLue } from './pagination'

describe('pagination lue dans l’URL', () => {
  it('commence à la première page de 50 lignes', () => {
    expect(paginationLue({})).toEqual({ page: 1, lignesParPage: 50 })
  })

  it('lit une page et un nombre de lignes proposé', () => {
    expect(paginationLue({ page: '3', lignes: '20' })).toEqual({
      page: 3,
      lignesParPage: 20,
    })
  })

  it.each([
    ['une page nulle', { page: '0' }],
    ['une page négative', { page: '-2' }],
    ['une page non numérique', { page: 'abc' }],
    ['une page décimale', { page: '1.5' }],
    ['un nombre de lignes non proposé', { lignes: '10000' }],
    ['un nombre de lignes non numérique', { lignes: 'tout' }],
  ])('revient aux valeurs par défaut pour %s', (_, parametres) => {
    expect(paginationLue(parametres)).toEqual({ page: 1, lignesParPage: 50 })
  })
})
