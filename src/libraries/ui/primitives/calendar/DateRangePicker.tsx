'use client'

import { format } from 'date-fns/format'
import { fr } from 'date-fns/locale/fr'
import { startOfMonth } from 'date-fns/startOfMonth'
import { type DateRange, DayPicker, useDayPicker } from 'react-day-picker'

export type { DateRange }

const formatWeekdayName = (date: Date) =>
  format(date, 'EEEEE', { locale: fr }).toUpperCase()

type CustomNavProps = {
  selected?: DateRange | undefined
  minDate?: Date | undefined
  maxDate?: Date | undefined
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
          <span className="ri-arrow-left-double-line" />
        </button>
        <button
          type="button"
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          aria-label="Mois précédent"
        >
          <span className="ri-arrow-left-s-line" />
        </button>
      </div>
      <div style={{ pointerEvents: 'auto' }}>
        <button
          type="button"
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          aria-label="Mois suivant"
        >
          <span className="ri-arrow-right-s-line" />
        </button>
        <button
          type="button"
          onClick={goToSelectionEnd}
          disabled={!canGoToEnd}
          aria-label="Aller à la fin de la sélection"
        >
          <span className="ri-arrow-right-double-line" />
        </button>
      </div>
    </nav>
  )
}

export type DateRangePickerProps = {
  value?: DateRange | undefined
  onChange?: ((range: DateRange | undefined) => void) | undefined
  minDate?: Date | undefined
  maxDate?: Date | undefined
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
    {...(value === undefined ? {} : { selected: value })}
    {...(onChange === undefined ? {} : { onSelect: onChange })}
    numberOfMonths={2}
    locale={fr}
    {...(value?.to === undefined ? {} : { defaultMonth: value.to })}
    captionLayout="dropdown"
    {...(minDate === undefined ? {} : { startMonth: minDate })}
    {...(maxDate === undefined ? {} : { endMonth: maxDate })}
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
      root: 'selecteur-de-periode',
      months: 'fr-flex fr-flex-gap-6v',
      month: 'fr-flex fr-direction-column fr-flex-gap-1v',
      month_caption: 'fr-flex fr-justify-content-center',
      caption_label: 'fr-display-none',
      dropdowns: 'fr-flex fr-flex-gap-1v fr-align-items-center',
      dropdown: 'selecteur-de-periode__liste-deroulante',
      weekdays: 'fr-flex',
      weekday:
        'fr-flex fr-align-items-center fr-justify-content-center fr-text--bold fr-text--uppercase selecteur-de-periode__jour-de-la-semaine',
      weeks: 'fr-flex fr-direction-column',
      week: 'fr-flex',
      day: 'fr-flex fr-align-items-center fr-justify-content-center selecteur-de-periode__jour',
      day_button: 'selecteur-de-periode__bouton-du-jour',
      selected: 'selecteur-de-periode__jour--selectionne',
      range_start: 'selecteur-de-periode__jour--debut',
      range_end: 'selecteur-de-periode__jour--fin',
      range_middle: 'selecteur-de-periode__jour--milieu',
      today: 'selecteur-de-periode__jour--aujourd-hui',
      outside: 'selecteur-de-periode__jour--hors-du-mois',
      disabled: 'selecteur-de-periode__jour--desactive',
    }}
  />
)
