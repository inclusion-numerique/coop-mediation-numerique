'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  type ActeurRole,
  acteurRoleLabels,
  acteurRoleValues,
} from '../validation/ActeursFilters'

const roleOptions: { label: string; value: ActeurRole | '' }[] = [
  { label: 'Tous les rôles', value: '' },
  ...acteurRoleValues.map((value) => ({
    label: acteurRoleLabels[value],
    value,
  })),
]

export const ActeurRoleFilter = ({
  defaultValue,
}: {
  defaultValue?: ActeurRole
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<ActeurRole | ''>(defaultValue ?? '')

  useEffect(() => {
    setRole(defaultValue ?? '')
  }, [defaultValue])

  const hasFilter = role !== ''

  const closePopover = (close: boolean = false) => {
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    if (role) {
      params.set('role', role)
    } else {
      params.delete('role')
    }
    closePopover(close)
  }

  const handleClearFilters = () => {
    setRole('')
    params.delete('role')
    closePopover(true)
  }

  const handleSelectRole = (value: ActeurRole | '') => {
    setRole(value)
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilter}>
          Rôle{hasFilter && <>&nbsp;·&nbsp;1</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 300 }} action={() => handleSubmit(true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <label className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par rôle&nbsp;:
          </label>
          {roleOptions.map(({ label, value: optionValue }) => {
            const id = `role-filter-radio-${optionValue || 'all'}`

            return (
              <div className="fr-fieldset__element fr-mb-1v" key={optionValue}>
                <div className="fr-radio-group">
                  <input
                    type="radio"
                    id={id}
                    name="role-type"
                    value={optionValue}
                    checked={role === optionValue}
                    onChange={() => handleSelectRole(optionValue)}
                  />
                  <label className="fr-label fr-whitespace-nowrap" htmlFor={id}>
                    {label}
                  </label>
                </div>
              </div>
            )
          })}
        </fieldset>
        <FilterFooter onClearFilters={handleClearFilters} />
      </form>
    </Popover>
  )
}
