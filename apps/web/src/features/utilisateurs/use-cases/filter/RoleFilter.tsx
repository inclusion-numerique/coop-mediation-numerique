'use client'

import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { Popover } from '@app/web/libs/ui/elements/Popover'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { RoleSlug, roleSlugOptions } from '../list/role'

export const RoleFilter = ({ defaultValue }: { defaultValue?: RoleSlug[] }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)
  const [roles, setRoles] = useState(defaultValue ?? [])

  useEffect(() => {
    setRoles(defaultValue ?? [])
  }, [defaultValue])

  const hasFilters = roles.length > 0

  const closePopover = (close: boolean = false) => {
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    roles.length > 0
      ? params.set('roles', roles.join(','))
      : params.delete('roles')

    closePopover(close)
  }

  const handleClearFilters = () => {
    setRoles([])
    params.delete('roles')
    closePopover(true)
  }

  const handleSelectFilter = (option: ChangeEvent<HTMLInputElement>) => {
    option.target.checked
      ? setRoles([...roles, option.target.value as RoleSlug])
      : setRoles(roles.filter((role) => role !== option.target.value))
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Rôle{hasFilters && ` · ${roles.length}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <label className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par&nbsp;:
          </label>
          {roleSlugOptions.map(({ label, value: optionValue }, index) => {
            const id = `role-filter-radio-${optionValue}`

            return (
              <div
                className={classNames(
                  'fr-fieldset__element',
                  index === roleSlugOptions.length - 1 && 'fr-mb-0',
                )}
                key={optionValue}
              >
                <div className="fr-checkbox-group">
                  <input
                    type="checkbox"
                    id={id}
                    name="role-type"
                    value={optionValue}
                    defaultChecked={defaultValue?.includes(optionValue)}
                    onChange={handleSelectFilter}
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
