'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import type { ActivitesFilters } from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import type { VocabulaireDeLaBarre } from './vocabulaire-de-la-barre'

export const ActiviteTypeFilter = ({
  defaultValue = {},
  enableRdvsFilter = false,
  vocabulaire,
}: {
  defaultValue?: Partial<Pick<ActivitesFilters, 'types' | 'rdvs'>>
  enableRdvsFilter?: boolean
  vocabulaire: Pick<
    VocabulaireDeLaBarre,
    'typesDActivite' | 'statutsDeRendezVous'
  >
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const [activiteTypes, setActiviteTypes] = useState(defaultValue.types ?? [])
  const [rdvs, setRdvs] = useState(defaultValue.rdvs ?? [])

  useEffect(() => {
    setActiviteTypes(defaultValue.types ?? [])
    setRdvs(defaultValue.rdvs ?? [])
  }, [defaultValue.types, defaultValue.rdvs])

  const filtersCount = activiteTypes.length + rdvs.length
  const hasFilters = filtersCount > 0

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
    const value = option.target.value

    option.target.checked
      ? setActiviteTypes([...activiteTypes, value])
      : setActiviteTypes(activiteTypes.filter((type) => type !== value))
  }

  const handleCheckRdvStatusFilter = (
    option: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = option.target.value

    if (option.target.checked) {
      const newValues = [...rdvs, value]
      setRdvs(newValues)
      return
    }

    setRdvs(rdvs.filter((status) => status !== value))
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Type{hasFilters && ` · ${filtersCount}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <label className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par&nbsp;:
          </label>
          {vocabulaire.typesDActivite.map(
            ({ label, value: optionValue }, index) => {
              const id = `activite-filter-radio-${optionValue}`

              return (
                <div
                  className={classNames(
                    'fr-fieldset__element',
                    index === vocabulaire.typesDActivite.length - 1 &&
                      'fr-mb-0',
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
                  className="fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8 fr-flex fr-ml-2v"
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
              {vocabulaire.statutsDeRendezVous.map(
                ({ label, value: optionValue }, index) => {
                  const id = `rdv-status-filter-radio-${optionValue}`
                  const isSmall = true
                  return (
                    <div
                      className={classNames(
                        'fr-fieldset__element',
                        index === vocabulaire.statutsDeRendezVous.length - 1 &&
                          'fr-mb-0',
                      )}
                      key={optionValue}
                    >
                      <div
                        className={classNames(
                          'fr-checkbox-group',
                          isSmall && 'fr-checkbox-group--sm',
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
                },
              )}
            </fieldset>
          </>
        )}
        <FilterFooter onClearFilters={handleClearFilters} />
      </form>
    </Popover>
  )
}
