'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const TYPE_ACTIVITE_OPTIONS = [
  { label: 'Évènement', value: 'Evenement' },
  { label: 'Partenariat', value: 'Partenariat' },
  { label: 'Animation', value: 'Animation' },
]

export const ActiviteCoordinationTypeFilter = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const types = searchParams.get('types')?.split(',').filter(Boolean) ?? []

  const closePopover = () => {
    router.replace(`?${params}`, { scroll: false })
  }

  const updateParamsAndClose = () => {
    form.state.values.types.length > 0
      ? params.set('types', form.state.values.types.join(','))
      : params.delete('types')
    closePopover()
  }

  const form = useAppForm({
    defaultValues: { types },
    onSubmit: updateParamsAndClose,
  })

  const clearFilters = () => {
    form.reset()
    params.delete('types')
    closePopover()
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(openState) => {
        if (openState) form.reset({ types })
        setIsOpen(openState)
      }}
      onEscapeKeyDown={updateParamsAndClose}
      onInteractOutside={updateParamsAndClose}
      trigger={
        <TriggerButton isOpen={isOpen}>
          Type
          {types.length > 0 && ` · ${types.length}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} onSubmit={handleSubmit(form)}>
        <form.AppForm>
          <form.AppField name="types">
            {(field) => (
              <field.Checkbox
                legend="Filtrer par&nbsp;:"
                isPending={false}
                isTiled={false}
                options={TYPE_ACTIVITE_OPTIONS}
              />
            )}
          </form.AppField>
        </form.AppForm>
        <FilterFooter onClearFilters={clearFilters} />
      </form>
    </Popover>
  )
}
