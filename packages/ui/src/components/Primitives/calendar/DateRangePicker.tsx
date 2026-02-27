'use client'

import { format, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { type DateRange, DayPicker, useDayPicker } from 'react-day-picker'
import styles from './DateRangePicker.module.css'

export type { DateRange }

const formatWeekdayName = (date: Date) =>
  format(date, 'EEEEE', { locale: fr }).toUpperCase()

type CustomNavProps = {
  selected?: DateRange
  minDate?: Date
  maxDate?: Date
}

const CustomNav = ({ selected, minDate, maxDate }: CustomNavProps) => {
  const { goToMonth, previousMonth, nextMonth, months } = useDayPicker()

  const firstDisplayedMonth = months[0]?.date
  const lastDisplayedMonth = months[months.length - 1]?.date

  const targetStart = selected?.from ?? minDate
  const targetEnd = selected?.to ?? maxDate

  const goToSelectionStart = () => {
    if (!targetStart) return
    goToMonth(startOfMonth(targetStart))
  }

  const goToSelectionEnd = () => {
    if (!targetEnd) return
    const endMonth = startOfMonth(targetEnd)
    endMonth.setMonth(endMonth.getMonth() - 1)
    goToMonth(endMonth)
  }

  const canGoToStart =
    targetStart &&
    firstDisplayedMonth &&
    startOfMonth(firstDisplayedMonth) > startOfMonth(targetStart)

  const canGoToEnd =
    targetEnd &&
    lastDisplayedMonth &&
    startOfMonth(lastDisplayedMonth) < startOfMonth(targetEnd)

  return (
    <nav
      className="fr-flex fr-justify-content-space-between fr-width-full fr-position-absolute fr-text-label--blue-france"
      style={{ pointerEvents: 'none' }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <button
          type="button"
          onClick={goToSelectionStart}
          disabled={!canGoToStart}
          aria-label="Aller au début de la sélection"
        >
          <span className="ri-arrow-left-double-line ri-lg" />
        </button>
        <button
          type="button"
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          aria-label="Mois précédent"
        >
          <span className="ri-arrow-left-s-line ri-lg" />
        </button>
      </div>
      <div style={{ pointerEvents: 'auto' }}>
        <button
          type="button"
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          aria-label="Mois suivant"
        >
          <span className="ri-arrow-right-s-line ri-lg" />
        </button>
        <button
          type="button"
          onClick={goToSelectionEnd}
          disabled={!canGoToEnd}
          aria-label="Aller à la fin de la sélection"
        >
          <span className="ri-arrow-right-double-line ri-lg" />
        </button>
      </div>
    </nav>
  )
}

export type DateRangePickerProps = {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  minDate?: Date
  maxDate?: Date
}

export const DateRangePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
}: DateRangePickerProps) => (
  <DayPicker
    className="fr-position-relative"
    mode="range"
    selected={value}
    onSelect={onChange}
    numberOfMonths={2}
    locale={fr}
    captionLayout="dropdown"
    startMonth={minDate}
    endMonth={maxDate}
    disabled={[
      ...(minDate ? [{ before: minDate }] : []),
      ...(maxDate ? [{ after: maxDate }] : []),
    ]}
    showOutsideDays={false}
    formatters={{ formatWeekdayName }}
    components={{
      Nav: () => (
        <CustomNav selected={value} minDate={minDate} maxDate={maxDate} />
      ),
    }}
    classNames={{
      root: styles.root,
      months: 'fr-flex fr-flex-gap-6v',
      month: 'fr-flex fr-direction-column fr-flex-gap-1v',
      month_caption: 'fr-flex fr-justify-content-center',
      caption_label: 'fr-display-none',
      dropdowns: 'fr-flex fr-flex-gap-1v fr-align-items-center',
      dropdown: styles.dropdown,
      weekdays: 'fr-flex',
      weekday: `fr-flex fr-align-items-center fr-justify-content-center fr-text--bold fr-text--uppercase ${styles.weekday}`,
      weeks: 'fr-flex fr-direction-column',
      week: 'fr-flex',
      day: `fr-flex fr-align-items-center fr-justify-content-center ${styles.day}`,
      day_button: styles.dayButton,
      selected: styles.selected,
      range_start: styles.rangeStart,
      range_end: styles.rangeEnd,
      range_middle: styles.rangeMiddle,
      today: styles.today,
      outside: styles.outside,
      disabled: styles.disabled,
    }}
  />
)
