import { failure, type Result, success } from '@/libraries/result'
import { DateDActivite } from './date-d-activite'
import { DateTropLointaine } from './errors'

const ANNEES_D_ANTICIPATION = 2

const VINGT_NEUF_FEVRIER = '02-29'

const VINGT_HUIT_FEVRIER = '02-28'

const memeJourHorsAnneeBissextile = (jour: string): string =>
  jour === VINGT_NEUF_FEVRIER ? VINGT_HUIT_FEVRIER : jour

export const derniereDateDActivite = (
  aujourdhui: DateDActivite,
): DateDActivite =>
  DateDActivite(
    `${Number(aujourdhui.slice(0, 4)) + ANNEES_D_ANTICIPATION}-${memeJourHorsAnneeBissextile(aujourdhui.slice(5))}`,
  )

export const dateDActiviteBornee = (
  date: DateDActivite,
  aujourdhui: DateDActivite,
): Result<DateDActivite, DateTropLointaine> =>
  date > derniereDateDActivite(aujourdhui)
    ? failure(DateTropLointaine(derniereDateDActivite(aujourdhui)))
    : success(date)
