'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import {
  TypeActiviteSlug,
  typeActiviteOptions,
  typeActiviteSlugOptions,
} from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import type {
  ActivitesFilters,
  RdvStatusFilterValue,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import {
  rdvStatusOptions,
  rdvStatusTous,
  rdvStatusValues,
} from '@app/web/rdv-service-public/rdvStatus'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { ChangeEvent, useEffect, useState } from 'react'

const rdvFilterOptions = [
  { label: 'Voir tout les RDVs', value: rdvStatusTous },
  ...rdvStatusOptions,
]

export const ActiviteTypeFilter = ({
  defaultValue = {},
  enableRdvsFilter = false,
}: {
  defaultValue?: Partial<Pick<ActivitesFilters, 'types' | 'rdvs'>>
  enableRdvsFilter?: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const [activiteTypes, setActiviteTypes] = useState(defaultValue.types ?? [])
  const [rdvs, setRdvs] = useState(defaultValue.rdvs ?? [])

  // If default values changes (e.g. router change), we reset the filters state
  useEffect(() => {
    setActiviteTypes(defaultValue.types ?? [])
    setRdvs(defaultValue.rdvs ?? [])
  }, [defaultValue.types, defaultValue.rdvs])

  const hasFilters = activiteTypes.length > 0 || rdvs.length > 0

  const closePopover = (close: boolean = false) => {
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    activiteTypes.length > 0
      ? params.set('types', activiteTypes.join(','))
      : params.delete('types')

    rdvs.length > 0 ? params.set('rdvs', rdvs.join(',')) : params.delete('rdvs')

    closePopover(close)
  }

  const handleClearFilters = () => {
    setActiviteTypes([])
    setRdvs([])
    params.delete('types')
    params.delete('rdvs')
    closePopover(true)
  }

  const handleCheckTypeFilter = (option: ChangeEvent<HTMLInputElement>) => {
    const value = option.target.value as TypeActiviteSlug

    option.target.checked
      ? setActiviteTypes([...activiteTypes, value])
      : setActiviteTypes(activiteTypes.filter((type) => type !== value))
  }

  const handleCheckRdvStatusFilter = (
    option: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = option.target.value as RdvStatusFilterValue

    // 'tous' checks and unchecks all rdvs
    if (value === rdvStatusTous) {
      option.target.checked
        ? setRdvs([rdvStatusTous, ...rdvStatusValues])
        : setRdvs([])
      return
    }

    if (option.target.checked) {
      const newValues = [...rdvs, value]

      // If all values are checked, we check "tous" also
      if (
        rdvStatusOptions.every((status) => newValues.includes(status.value))
      ) {
        setRdvs([rdvStatusTous, ...newValues])
        return
      }
      setRdvs(newValues)
      return
    }

    // If we uncheck a value, we uncheck "tous" also
    setRdvs(
      rdvs.filter((status) => status !== value && status !== rdvStatusTous),
    )
  }

  // if "all" rdvs is checked, it counts as 1 even if there are other rdvs types checked
  const filterValuesCount =
    activiteTypes.length + (rdvs.includes(rdvStatusTous) ? 1 : rdvs.length)

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Type{hasFilters && ` · ${activiteTypes.length + filterValuesCount}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <label className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par&nbsp;:
          </label>
          {typeActiviteSlugOptions.map(
            ({ label, value: optionValue }, index) => {
              const id = `activite-filter-radio-${optionValue}`

              return (
                <div
                  className={classNames(
                    'fr-fieldset__element',
                    index === typeActiviteOptions.length - 1 && 'fr-mb-0',
                  )}
                  key={optionValue}
                >
                  <div className="fr-checkbox-group">
                    <input
                      type="checkbox"
                      id={id}
                      name="activite-type"
                      value={optionValue}
                      defaultChecked={defaultValue?.types?.includes(
                        optionValue,
                      )}
                      onChange={handleCheckTypeFilter}
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
            },
          )}
        </fieldset>
        {enableRdvsFilter && (
          <>
            <hr className="fr-separator-6v" />
            <fieldset className="fr-fieldset fr-mb-0">
              <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mb-4v">
                <div
                  className="fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8 fr-flex"
                  aria-hidden
                >
                  <RDVServicePublicLogo
                    className="fr-display-block"
                    height={24}
                    width={24}
                  />
                </div>
                <label className="fr-label fr-mb-0 fr-text--bold">
                  Rendez-vous via RDV&nbsp;Service&nbsp;Public
                </label>
              </div>
              {rdvFilterOptions.map(({ label, value: optionValue }, index) => {
                const id = `rdv-status-filter-radio-${optionValue}`
                const isSmall = optionValue !== rdvStatusTous
                return (
                  <div
                    className={classNames(
                      'fr-fieldset__element',
                      index === rdvFilterOptions.length - 1 && 'fr-mb-0',
                    )}
                    key={optionValue}
                  >
                    <div
                      className={classNames(
                        'fr-checkbox-group',
                        isSmall && 'fr-checkbox-group--sm fr-ml-4w',
                      )}
                    >
                      <input
                        type="checkbox"
                        id={id}
                        name="rdv-status"
                        value={optionValue}
                        checked={rdvs.includes(optionValue)}
                        onChange={handleCheckRdvStatusFilter}
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
            </fieldset>
          </>
        )}
        <FilterFooter onClearFilters={handleClearFilters} />
      </form>
    </Popover>
  )
}
