import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { Effectif, Jour, type PeriodeDesStatistiques } from '../../../domain'
import { compterLesAccompagnements } from './compter-les-accompagnements'
import type { ActivitesEtAccompagnementsComptes } from './ports'
import {
  anonymes,
  type TotauxDesAccompagnements,
} from './totaux-des-accompagnements'

const activitesEtAccompagnements: ActivitesEtAccompagnementsComptes = {
  activites: {
    total: Effectif(5),
    individuelles: Effectif(3),
    collectives: Effectif(2),
  },
  accompagnements: { total: Effectif(9), collectifs: Effectif(6) },
}

const totaux = (nouvelles: number): TotauxDesAccompagnements => ({
  ...activitesEtAccompagnements,
  personnes: {
    total: Effectif(7),
    suivies: Effectif(3),
    nouvelles: Effectif(nouvelles),
  },
})

describe('compter les accompagnements', () => {
  it.each<{
    readonly cas: string
    readonly periode: PeriodeDesStatistiques
    readonly nouvelles: number
  }>([
    {
      cas: 'compte les nouvelles personnes sur une période bornée des deux côtés',
      periode: { du: Jour('2026-01-01'), au: Jour('2026-03-31') },
      nouvelles: 4,
    },
    {
      cas: 'ne compte pas les nouvelles personnes sans fin de période',
      periode: { du: Jour('2026-01-01'), au: null },
      nouvelles: 0,
    },
    {
      cas: 'ne compte pas les nouvelles personnes sans période',
      periode: { du: null, au: null },
      nouvelles: 0,
    },
  ])('$cas', async ({ periode, nouvelles }) => {
    expect(
      await compterLesAccompagnements({
        activitesComptees: async () => activitesEtAccompagnements,
        personnesComptees: async () => ({
          total: Effectif(7),
          suivies: Effectif(3),
        }),
        nouvellesPersonnesComptees: async () => Effectif(4),
      })({ criteres: { periode } }),
    ).toEqual(success(totaux(nouvelles)))
  })

  it('les personnes anonymes sont celles qui ne sont pas suivies', () => {
    expect(anonymes(totaux(0))).toBe(4)
  })
})
