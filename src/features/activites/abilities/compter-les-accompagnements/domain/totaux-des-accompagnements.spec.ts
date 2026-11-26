import { describe, expect, it } from 'vitest'
import { Effectif, Jour, type PeriodeDesStatistiques } from '../../../domain'
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

  it.each<{
    readonly cas: string
    readonly periode: PeriodeDesStatistiques
    readonly comptees: boolean
  }>([
    {
      cas: 'compte les nouvelles personnes sur une période bornée des deux côtés',
      periode: { du: Jour('2026-01-01'), au: Jour('2026-03-31') },
      comptees: true,
    },
    {
      cas: 'ne compte pas les nouvelles personnes sans fin de période',
      periode: { du: Jour('2026-01-01'), au: null },
      comptees: false,
    },
    {
      cas: 'ne compte pas les nouvelles personnes sans période',
      periode: { du: null, au: null },
      comptees: false,
    },
  ])('$cas', ({ periode, comptees }) => {
    expect(nouvellesComptees(periode)).toBe(comptees)
  })
})
