import classNames from 'classnames'
import type { CalendarProps as ReactCalendarProps } from 'react-calendar'
import ReactCalendar from 'react-calendar'
import { dateAsIsoDay, dateFormatter } from '@/libraries/date'

const today = dateAsIsoDay(new Date())

const tileClassName: ReactCalendarProps['tileClassName'] = ({ date }) => {
  if (dateAsIsoDay(date) === today) {
    return 'calendrier__aujourd-hui'
  }
  return ''
}

// date-fn date (vendredi) -> V
const dayLetterFormatter = dateFormatter('E')

const formatShortWeekday: ReactCalendarProps['formatShortWeekday'] = (
  _locale,
  date,
) => dayLetterFormatter(date).charAt(0).toUpperCase()

export const Calendar = ({
  className,
  tileClassName: tileClassNameProperty,
  ...calendarProps
}: ReactCalendarProps) => (
  <ReactCalendar
    className={classNames('calendrier', className)}
    tileClassName={tileClassNameProperty ?? tileClassName}
    formatShortWeekday={formatShortWeekday}
    {...calendarProps}
  />
)

export type CalendarProps = ReactCalendarProps
