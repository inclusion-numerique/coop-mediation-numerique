'use client'

import CustomSelect from '@app/ui/components/CustomSelect/CustomSelect'
import { SelectOption } from '@app/ui/components/Form/utils/options'
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
import { useEffect, useMemo, useState } from 'react'
import type { OptionDeBeneficiaire } from './option-de-beneficiaire'

type OptionDeBeneficiaireWithId = OptionDeBeneficiaire & {
  value: { id: string }
}

const onlyDefinedIds = (
  beneficiaireOption: OptionDeBeneficiaire,
): beneficiaireOption is OptionDeBeneficiaireWithId =>
  beneficiaireOption.value?.id != null

const toSelectOption = ({
  label,
  value: { id: value },
}: OptionDeBeneficiaireWithId): SelectOption => ({
  label,
  value,
})

export const BeneficiaireFilter = ({
  defaultValue,
  initialBeneficiairesOptions,
}: {
  defaultValue: string[]
  initialBeneficiairesOptions: OptionDeBeneficiaire[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const valeursParDefaut = defaultValue.join(',')

  const beneficiairesOptions: SelectOption[] = useMemo(
    () =>
      initialBeneficiairesOptions.filter(onlyDefinedIds).map(toSelectOption),
    [initialBeneficiairesOptions],
  )

  const selectedBeneficiaires = useMemo(
    () =>
      beneficiairesOptions.filter(
        defautValuesFrom(new Set(valeursParDefaut.split(','))),
      ),
    [beneficiairesOptions, valeursParDefaut],
  )

  const [beneficiaires, setBeneficiaires] = useState(selectedBeneficiaires)

  useEffect(() => {
    setBeneficiaires(selectedBeneficiaires)
  }, [selectedBeneficiaires])

  const hasFilters = beneficiaires.length > 0

  const closePopover = (close: boolean = false) => {
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    update(params)('beneficiaires', beneficiaires)
    resetPagination(params)
    closePopover(close)
  }

  const handleClearFilters = () => {
    setBeneficiaires([])
    update(params)('beneficiaires', [])
    resetPagination(params)
    closePopover(true)
  }

  const handleSelectFilter = (option: SelectOption | null) => {
    if (!option) return handleClearFilters()
    setBeneficiaires([...beneficiaires, option])
  }

  const handleRemoveFilter = (option: SelectOption) =>
    setBeneficiaires(beneficiaires.filter(matchingOption(option)))

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Bénéficiaire{hasFilters && ` · ${beneficiaires.length}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <label
          className="fr-label fr-mb-1v fr-text--bold"
          htmlFor="beneficiaire-filter"
        >
          Filtrer par&nbsp;:
        </label>
        <CustomSelect<SelectOption>
          inputId="beneficiaire-filter"
          instanceId="beneficiaire-filter-search"
          placeholder="Choisir un bénéficiaire"
          className="fr-mb-2v fr-mt-3v"
          options={beneficiairesOptions.filter(
            availableOptionsIn(beneficiaires),
          )}
          onChange={handleSelectFilter}
          value={[]}
        />
        {hasFilters && (
          <>
            <FilterSelection
              options={beneficiaires}
              onRemoveFilter={handleRemoveFilter}
              label={{
                singular: 'bénéficiaire sélectionné',
                plural: 'bénéficiaires sélectionnés',
              }}
            />
            <FilterFooter onClearFilters={handleClearFilters} />
          </>
        )}
      </form>
    </Popover>
  )
}
