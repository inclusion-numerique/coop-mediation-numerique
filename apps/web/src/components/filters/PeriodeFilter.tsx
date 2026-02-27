'use client'

import {
  type DateRange,
  DateRangePicker,
} from '@app/ui/components/Primitives/calendar/DateRangePicker'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { formatDate } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export type PeriodFilterValue = { du: string; au: string }

export const PeriodeFilter = ({
  minDate,
  maxDate,
  defaultValue,
}: {
  minDate?: Date
  maxDate?: Date
  defaultValue?: PeriodFilterValue
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>(
    defaultValue
      ? { from: new Date(defaultValue.du), to: new Date(defaultValue.au) }
      : undefined,
  )

  useEffect(() => {
    setRange(
      defaultValue
        ? { from: new Date(defaultValue.du), to: new Date(defaultValue.au) }
        : undefined,
    )
  }, [defaultValue])

  const applyFilters = (close = false) => {
    const params = new URLSearchParams(searchParams.toString())

    if (range?.from && range?.to) {
      params.set('du', dateAsIsoDay(range.from))
      params.set('au', dateAsIsoDay(range.to))
    } else {
      params.delete('du')
      params.delete('au')
    }

    if (close) {
      setIsOpen(false)
    }
    router.replace(`?${params}`, { scroll: false })
  }

  const handleClearFilters = () => {
    setRange(undefined)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('du')
    params.delete('au')
    setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const { from, to } = range ?? {}
  const isComplete = from && to

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => applyFilters()}
      onEscapeKeyDown={() => applyFilters()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={!!isComplete}>
          {isComplete
            ? `${formatDate(from, 'dd.MM.yy')} - ${formatDate(to, 'dd.MM.yy')}`
            : 'Période'}
        </TriggerButton>
      }
    >
      <DateRangePicker
        value={range}
        onChange={setRange}
        minDate={minDate}
        maxDate={maxDate}
      />

      {isComplete && (
        <form action={() => applyFilters(true)}>
          <FilterFooter onClearFilters={handleClearFilters} />
        </form>
      )}
    </Popover>
  )
}
