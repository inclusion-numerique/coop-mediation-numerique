import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { failure, type Result, success } from '@/libraries/result'

export const PREMIERE_DATE_D_ACTIVITE = '2020-11-17'

const ANNEES_D_ANTICIPATION = 2

export const DateDActivite = defineModel(
  z.iso
    .date()
    .refine((date) => date >= PREMIERE_DATE_D_ACTIVITE)
    .brand('DateDActivite'),
)

export type DateDActivite = Model.TypeOf<typeof DateDActivite>

export type DateTropLointaine = {
  readonly _tag: 'DateTropLointaine'
  readonly auPlusTard: DateDActivite
}

export const DateTropLointaine = (
  auPlusTard: DateDActivite,
): DateTropLointaine => ({ _tag: 'DateTropLointaine', auPlusTard })

export const dateDActiviteDuJour = (instant: Date): DateDActivite =>
  DateDActivite(instant.toISOString().slice(0, 10))

export const derniereDateDActivite = (
  aujourdhui: DateDActivite,
): DateDActivite => {
  const instant = new Date(`${aujourdhui}T00:00:00.000Z`)
  const annee = instant.getUTCFullYear()
  const mois = instant.getUTCMonth() + 1
  const jour = instant.getUTCDate()
  const dernierJourDuMois = new Date(
    Date.UTC(annee + ANNEES_D_ANTICIPATION, mois, 0),
  ).getUTCDate()
  return dateDActiviteDuJour(
    new Date(
      Date.UTC(
        annee + ANNEES_D_ANTICIPATION,
        mois - 1,
        Math.min(jour, dernierJourDuMois),
      ),
    ),
  )
}

export const dateDActiviteBornee = (
  date: DateDActivite,
  aujourdhui: DateDActivite,
): Result<DateDActivite, DateTropLointaine> =>
  date > derniereDateDActivite(aujourdhui)
    ? failure(DateTropLointaine(derniereDateDActivite(aujourdhui)))
    : success(date)
