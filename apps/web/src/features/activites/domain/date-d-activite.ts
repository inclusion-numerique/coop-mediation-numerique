import { defineModel, type Model } from '@app/web/libraries/model'
import { failure, type Result, success } from '@app/web/libraries/result'
import { z } from 'zod'
import { DateTropLointaine } from './errors'

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
  const [annee, mois, jour] = aujourdhui.split('-').map(Number)
  return dateDActiviteDuJour(
    new Date(Date.UTC(annee + ANNEES_D_ANTICIPATION, mois - 1, jour)),
  )
}

export const dateDActiviteBornee = (
  date: DateDActivite,
  aujourdhui: DateDActivite,
): Result<DateDActivite, DateTropLointaine> =>
  date > derniereDateDActivite(aujourdhui)
    ? failure(DateTropLointaine(derniereDateDActivite(aujourdhui)))
    : success(date)
