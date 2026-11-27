import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PREMIERE_DATE_D_ACTIVITE = '2020-11-17'

const ANNEES_D_ANTICIPATION = 2

export const DateDActivite = defineModel(
  z.iso
    .date()
    .refine((date) => date >= PREMIERE_DATE_D_ACTIVITE)
    .brand('DateDActivite'),
)

export type DateDActivite = Model.TypeOf<typeof DateDActivite>

export const dateDActiviteDuJour = (instant: Date): DateDActivite =>
  DateDActivite(instant.toISOString().slice(0, 10))

export const derniereDateDActivite = (
  aujourdhui: DateDActivite,
): DateDActivite => {
  const instant = new Date(`${aujourdhui}T00:00:00.000Z`)
  const annee = instant.getUTCFullYear() + ANNEES_D_ANTICIPATION
  const mois = instant.getUTCMonth()
  const dernierJourDuMois = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate()
  return dateDActiviteDuJour(
    new Date(
      Date.UTC(annee, mois, Math.min(instant.getUTCDate(), dernierJourDuMois)),
    ),
  )
}
