import { criteresDExposition } from './criteres-d-exposition'

describe('critères d’exposition des utilisateurs', () => {
  it('expose tout sans filtre', () => {
    expect(criteresDExposition({})).toEqual({
      supprimes: 'Inclus',
      conseillerNumerique: null,
      identifiantsConseillerNumerique: [],
      identifiantsDataspace: [],
    })
  })

  it('lit les filtres de la requête', () => {
    expect(
      criteresDExposition({
        soft_deleted: '0',
        conseiller_numerique: '1',
        conseiller_numerique_id_pg: ['12', 'abc'],
        dataspace_id: ['7'],
      }),
    ).toEqual({
      supprimes: 'Exclus',
      conseillerNumerique: true,
      identifiantsConseillerNumerique: [12],
      identifiantsDataspace: [7],
    })
  })

  it('retient seulement les supprimés sur demande', () => {
    expect(criteresDExposition({ soft_deleted: '1' }).supprimes).toBe('Seuls')
  })
})
