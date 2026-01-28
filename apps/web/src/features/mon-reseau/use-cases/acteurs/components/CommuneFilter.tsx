'use client'

import CustomSelect from '@app/ui/components/CustomSelect/CustomSelect'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import { FilterSelection } from '@app/web/libs/filters/FilterSelection'
import {
  availableOptionsIn,
  defautValuesFrom,
  matchingOption,
  resetPagination,
  update,
} from '@app/web/libs/filters/helpers'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const CommuneFilter = ({
  defaultValue = [],
  communesOptions = [],
}: {
  defaultValue?: string[]
  communesOptions: SelectOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const defaultValueSet = new Set(defaultValue)

  const filteredCommunesOptions = communesOptions.filter(
    defautValuesFrom(defaultValueSet),
  )

  const [communes, setCommunes] = useState(filteredCommunesOptions)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to trigger when props options change
  useEffect(() => {
    setCommunes(filteredCommunesOptions)
  }, [communesOptions])

  const hasFilters = communes.length > 0

  const availableOptions = communesOptions.filter(availableOptionsIn(communes))

  const closePopover = (close: boolean = false) => {
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    update(params)('communes', communes)
    resetPagination(params)

    closePopover(close)
  }

  const handleClearFilters = () => {
    setCommunes([])

    update(params)('communes', [])
    resetPagination(params)

    closePopover(true)
  }

  const handleSelectFilter = (option: SelectOption | null) => {
    if (!option) return handleClearFilters()
    setCommunes((prev) => [...prev, option])
  }

  const handleRemoveFilter = (option: SelectOption) => {
    setCommunes(communes.filter(matchingOption(option)))
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Commune{hasFilters && <>&nbsp;·&nbsp;{communes.length}</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <label
          className="fr-label fr-mb-1v fr-text--bold"
          htmlFor="commune-filter"
        >
          Filtrer par commune&nbsp;:
        </label>
        <CustomSelect<SelectOption>
          instanceId="commune-filter-value"
          placeholder="Sélectionner une commune"
          className="fr-mb-2v fr-mt-3v"
          options={availableOptions}
          onChange={handleSelectFilter}
          value={[]}
        />
        {hasFilters && (
          <>
            <FilterSelection
              options={communes}
              onRemoveFilter={handleRemoveFilter}
              label={{
                singular: 'commune sélectionnée',
                plural: 'communes sélectionnées',
              }}
            />
            <FilterFooter onClearFilters={handleClearFilters} />
          </>
        )}
      </form>
    </Popover>
  )
}
