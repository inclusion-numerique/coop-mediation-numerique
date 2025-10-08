import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { ActivitesAndRdvsByDate } from '../db/activitesQueries'
import { SearchActiviteAndRdvResultItem } from '../db/searchActiviteAndRdvs'

export const groupActivitesAndRdvsByDate = ({
  items,
}: {
  items: SearchActiviteAndRdvResultItem[]
}): ActivitesAndRdvsByDate[] => {
  const byDateRecord = items.reduce<
    Record<string, SearchActiviteAndRdvResultItem[]>
  >((accumulator, item) => {
    const date = dateAsIsoDay(item.kind === 'rdv' ? item.startsAt : item.date)
    if (!accumulator[date]) {
      accumulator[date] = []
    }
    accumulator[date].push(item)
    return accumulator
  }, {})

  return (
    Object.entries(byDateRecord)
      .map(([date, items]) => ({
        date,
        items,
      }))
      // sort by date desc
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )
}
