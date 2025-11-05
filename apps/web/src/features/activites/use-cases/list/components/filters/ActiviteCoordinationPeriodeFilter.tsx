'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { formatDate } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import z from 'zod'

export const DateRangeValidation = z
  .object({
    du: z.date({ message: 'La date de début est requise' }),
    au: z.date({ message: 'La date de fin est requise' }),
  })
  .refine((data) => data.du <= data.au, {
    message: 'La date de fin doit être postérieure ou égale à la date de début',
    path: ['au'],
  })

const toFormDates = (du: string | null, au: string | null) => ({
  du: du ? new Date(du) : null,
  au: au ? new Date(au) : null,
})

export const ActiviteCoordinationPeriodeFilter = ({
  minDate,
  maxDate,
}: {
  minDate: Date
  maxDate: Date
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const du = searchParams.get('du')
  const au = searchParams.get('au')

  const setFilters = () => {
    const { du, au } = form.state.values
    if (du == null || au == null) return
    params.set('du', dateAsIsoDay(du))
    params.set('au', dateAsIsoDay(au))
    router.replace(`?${params}`, { scroll: false })
  }

  const clearFilters = () => {
    form.reset()
    params.delete('du')
    params.delete('au')
    router.replace(`?${params}`, { scroll: false })
    setIsOpen(false)
  }

  const form = useAppForm({
    defaultValues: toFormDates(du, au),
    onSubmit: setFilters,
    validators: {
      onChange: DateRangeValidation,
    },
  })

  return (
    <Popover
      open={isOpen}
      onOpenChange={(openState) => {
        openState && form.reset(toFormDates(du, au))
        setIsOpen(openState)
      }}
      onEscapeKeyDown={() => form.handleSubmit()}
      onInteractOutside={() => form.handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={du != null && au != null}>
          {du != null && au != null
            ? `${formatDate(du, 'dd.MM.yy')} - ${formatDate(au, 'dd.MM.yy')}`
            : 'Période'}
        </TriggerButton>
      }
    >
      <form
        onSubmit={(e) => handleSubmit(form)(e).then(() => setIsOpen(false))}
      >
        <div className="fr-flex fr-flex-gap-4v">
          <form.AppForm>
            <form.AppField name="du">
              {(field) => (
                <div className="fr-flex fr-align-items-center fr-direction-column">
                  <h4 className="fr-text--bold fr-text--md fr-mb-2v">Début</h4>
                  <field.Calendar
                    isPending={false}
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField name="au">
              {(field) => (
                <div className="fr-flex fr-align-items-center fr-direction-column">
                  <h4 className="fr-text--bold fr-text--md fr-mb-2v">Fin</h4>
                  <field.Calendar
                    isPending={false}
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>
              )}
            </form.AppField>
          </form.AppForm>
        </div>
        <form.Subscribe selector={(state) => state.values}>
          {(values) =>
            DateRangeValidation.safeParse(values).success && (
              <FilterFooter onClearFilters={clearFilters} />
            )
          }
        </form.Subscribe>
      </form>
    </Popover>
  )
}
