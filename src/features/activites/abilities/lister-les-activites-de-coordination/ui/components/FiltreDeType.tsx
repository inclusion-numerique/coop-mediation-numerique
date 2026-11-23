'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FilterFooter } from '@/libraries/filtres/FilterFooter'
import TriggerButton from '@/libraries/filtres/TriggerButton'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { Popover } from '@/libraries/ui/components/Primitives/Popover'
import { LIBELLES_DES_TYPES } from '../../../../ui/libelles-de-coordination'

export const FiltreDeType = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const types = searchParams.get('types')?.split(',').filter(Boolean) ?? []

  const setFilters = () => {
    form.state.values.types.length > 0
      ? params.set('types', form.state.values.types.join(','))
      : params.delete('types')
    router.replace(`?${params}`, { scroll: false })
  }

  const clearFilters = () => {
    form.reset()
    params.delete('types')
    router.replace(`?${params}`, { scroll: false })
    setIsOpen(false)
  }

  const form = useAppForm({
    defaultValues: { types },
    onSubmit: setFilters,
  })

  return (
    <Popover
      open={isOpen}
      onOpenChange={(openState) => {
        openState && form.reset({ types })
        setIsOpen(openState)
      }}
      onEscapeKeyDown={() => form.handleSubmit()}
      onInteractOutside={() => form.handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={types.length > 0}>
          Type
          {types.length > 0 && ` · ${types.length}`}
        </TriggerButton>
      }
    >
      <form
        style={{ width: 384 }}
        onSubmit={(e) => handleSubmit(form)(e).then(() => setIsOpen(false))}
      >
        <form.AppForm>
          <form.AppField name="types">
            {(field) => (
              <field.Checkbox
                legend="Filtrer par&nbsp;:"
                isPending={false}
                isTiled={false}
                options={[...LIBELLES_DES_TYPES]}
              />
            )}
          </form.AppField>
        </form.AppForm>
        <FilterFooter onClearFilters={clearFilters} />
      </form>
    </Popover>
  )
}
