import { Effectif, Jour } from '../../../domain'
import {
  anonymes,
  nouvellesComptees,
  type TotauxDesAccompagnements,
} from './totaux-des-accompagnements'

const totaux = (total: number, suivies: number): TotauxDesAccompagnements => ({
  activites: {
    total: Effectif(0),
    individuelles: Effectif(0),
    collectives: Effectif(0),
  },
  accompagnements: { total: Effectif(0), collectifs: Effectif(0) },
  personnes: {
    total: Effectif(total),
    suivies: Effectif(suivies),
    nouvelles: Effectif(0),
  },
})

describe('totaux des accompagnements', () => {
  it('les personnes anonymes sont celles qui ne sont pas suivies', () => {
    expect(anonymes(totaux(7, 3))).toBe(4)
  })

  it('ne compte les nouvelles personnes que sur une période bornée des deux côtés', () => {
    expect(
      nouvellesComptees({ du: Jour('2026-01-01'), au: Jour('2026-03-31') }),
    ).toBe(true)
    expect(nouvellesComptees({ du: Jour('2026-01-01'), au: null })).toBe(false)
    expect(nouvellesComptees({ du: null, au: null })).toBe(false)
  })
})
