import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { dateFormatter } from '@app/web/utils/formatDate'
import classNames from 'classnames'
import ReactCalendar from 'react-calendar'
import type { CalendarProps as ReactCalendarProps } from 'react-calendar'
import styles from './Calendar.module.css'

const today = dateAsIsoDay(new Date())

const tileClassName: ReactCalendarProps['tileClassName'] = ({ date }) => {
  if (dateAsIsoDay(date) === today) {
    return styles.today
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
    className={classNames(styles.calendar, className)}
    tileClassName={tileClassNameProperty ?? tileClassName}
    formatShortWeekday={formatShortWeekday}
    {...calendarProps}
  />
)

export type CalendarProps = ReactCalendarProps
