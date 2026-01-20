'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import type { RoleFiltre } from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import { resetPagination } from '@app/web/libs/filters/helpers'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const roleOptions: { label: string; value: RoleFiltre | '' }[] = [
  { label: 'Tous les rôles', value: '' },
  { label: 'Conseillers numériques', value: 'conseiller-numerique' },
  { label: 'Médiateurs numériques', value: 'mediateur-numerique' },
]

export const RoleFilter = ({ defaultValue }: { defaultValue?: RoleFiltre }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<RoleFiltre | ''>(defaultValue ?? '')

  useEffect(() => {
    setRole(defaultValue ?? '')
  }, [defaultValue])

  const hasFilter = role !== ''

  const closePopover = (close: boolean = false) => {
    const params = new URLSearchParams(searchParams.toString())
    if (role) {
      params.set('role', role)
    } else {
      params.delete('role')
    }
    resetPagination(params)
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    closePopover(close)
  }

  const handleSelectRole = (value: RoleFiltre | '') => {
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
          <label className="fr-label fr-mb-4v fr-text--bold">
            Filtrer par rôle&nbsp;:
          </label>
          <div className="fr-flex fr-direction-column fr-flex-gap-4v">
            {roleOptions.map(({ label, value: optionValue }) => {
              const id = `role-filter-radio-${optionValue || 'all'}`
              return (
                <div className="fr-fieldset__element fr-mb-0" key={optionValue}>
                  <div className="fr-radio-group">
                    <input
                      type="radio"
                      id={id}
                      name="role-type"
                      value={optionValue}
                      checked={role === optionValue}
                      onChange={() => handleSelectRole(optionValue)}
                    />
                    <label
                      className="fr-label fr-whitespace-nowrap"
                      htmlFor={id}
                    >
                      {label}
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </fieldset>
      </form>
    </Popover>
  )
}
