import { ActiviteDates } from '@app/web/features/rdvsp/queries/getFirstAndLastRdvDate'

export const getWidestActiviteDatesRange = (
  ...ranges: ActiviteDates[]
): ActiviteDates =>
  ranges.reduce(
    ({ first, last }, current) => {
      if (first && (!current.first || first < current.first)) {
        current.first = first
      }

      if (last && (!current.last || last > current.last)) {
        current.last = last
      }

      return current
    },
    {
      first: undefined,
      last: undefined,
    },
  )
