import { failure, type Result, success } from '@/libraries/result'
import { type DateDActivite, derniereDateDActivite } from './date-d-activite'
import { DateTropLointaine } from './errors'

export const dateDActiviteBornee = (
  date: DateDActivite,
  aujourdhui: DateDActivite,
): Result<DateDActivite, DateTropLointaine> =>
  date > derniereDateDActivite(aujourdhui)
    ? failure(DateTropLointaine(derniereDateDActivite(aujourdhui)))
    : success(date)
