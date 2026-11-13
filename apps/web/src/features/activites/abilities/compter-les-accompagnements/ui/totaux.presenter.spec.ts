import { Effectif } from '../../../domain'
import { totauxPresentes } from './totaux.presenter'

describe('totaux présentés', () => {
  it('reprend les chiffres clés et leurs proportions', () => {
    expect(
      totauxPresentes({
        activites: {
          total: Effectif(4),
          individuelles: Effectif(3),
          collectives: Effectif(1),
        },
        accompagnements: { total: Effectif(8), collectifs: Effectif(5) },
        personnes: {
          total: Effectif(7),
          suivies: Effectif(2),
          nouvelles: Effectif(1),
        },
      }),
    ).toEqual({
      activites: {
        total: 4,
        individuels: { total: 3, proportion: 75 },
        collectifs: { total: 1, proportion: 25, participants: 5 },
      },
      accompagnements: {
        total: 8,
        individuels: { total: 3, proportion: 37.5 },
        collectifs: { total: 5, proportion: 62.5 },
      },
      beneficiaires: { total: 7, nouveaux: 1, suivis: 2, anonymes: 5 },
    })
  })
})
