import { parametresDeLaPagination } from './pagination.presenter'

describe('paramètres de la pagination des coordinations', () => {
  it('conserve les filtres actifs pour changer de page', () => {
    expect(
      parametresDeLaPagination({
        du: '2026-01-01',
        au: '2026-06-30',
        types: 'Partenariat',
        tags: 'a',
        page: '2',
        lignes: '20',
      }),
    ).toEqual({
      du: '2026-01-01',
      au: '2026-06-30',
      types: 'Partenariat',
      tags: 'a',
      page: '2',
      lignes: '20',
    })
  })

  it('écarte les paramètres étrangers et absents', () => {
    expect(parametresDeLaPagination({ ordre: 'asc', page: undefined })).toEqual(
      {},
    )
  })
})
