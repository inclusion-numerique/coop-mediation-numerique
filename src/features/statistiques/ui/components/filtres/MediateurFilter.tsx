'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { MediateurOption } from '@/features/statistiques/ui/presenters/options-de-la-barre.presenter'
import { FilterFooter } from '@/libraries/filtres/FilterFooter'
import { FilterSelection } from '@/libraries/filtres/FilterSelection'
import {
  availableOptionsIn,
  defautValuesFrom,
  matchingOption,
} from '@/libraries/filtres/helpers'
import TriggerButton from '@/libraries/filtres/TriggerButton'
import { adresseAvec } from '@/libraries/parametres-d-url'
import CustomSelect from '@/libraries/ui/components/CustomSelect/CustomSelect'
import { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { Popover } from '@/libraries/ui/components/Primitives/Popover'

type MediateurOptionWithId = MediateurOption & {
  value: { mediateurId: string }
}

const onlyDefinedIds = (
  mediateurOption: MediateurOption,
): mediateurOption is MediateurOptionWithId =>
  mediateurOption.value?.mediateurId != null

const toSelectOption = ({
  label,
  value: { mediateurId: value },
}: MediateurOptionWithId): SelectOption => ({
  label,
  value,
})

export const MediateurFilter = ({
  defaultValue,
  initialMediateursOptions,
}: {
  defaultValue: string[]
  initialMediateursOptions: MediateurOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)

  const valeursParDefaut = defaultValue.join(',')

  const mediateursOptions: SelectOption[] = useMemo(
    () => initialMediateursOptions.filter(onlyDefinedIds).map(toSelectOption),
    [initialMediateursOptions],
  )

  const selectedMediateurs = useMemo(
    () =>
      mediateursOptions.filter(
        defautValuesFrom(new Set(valeursParDefaut.split(','))),
      ),
    [mediateursOptions, valeursParDefaut],
  )

  const [mediateurs, setMediateurs] = useState(selectedMediateurs)

  useEffect(() => {
    setMediateurs(selectedMediateurs)
  }, [selectedMediateurs])

  const hasFilters = mediateurs.length > 0

  const closePopover = (close: boolean, choisis: SelectOption[]) => {
    close && setIsOpen(false)
    router.replace(
      adresseAvec(`?${searchParams}`, {
        mediateurs:
          choisis.length > 0
            ? choisis.map(({ value }) => value).join(',')
            : null,
        page: null,
      }) || '?',
      { scroll: false },
    )
  }

  const handleSubmit = (close: boolean = false) =>
    closePopover(close, mediateurs)

  const handleClearFilters = () => {
    setMediateurs([])
    closePopover(true, [])
  }

  const handleSelectFilter = (option: SelectOption | null) => {
    if (!option) return handleClearFilters()
    setMediateurs([...mediateurs, option])
  }

  const handleRemoveFilter = (option: SelectOption) =>
    setMediateurs(mediateurs.filter(matchingOption(option)))

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Médiateur{hasFilters && ` · ${mediateurs.length}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <label
          className="fr-label fr-mb-1v fr-text--bold"
          htmlFor="mediateur-filter"
        >
          Filtrer par&nbsp;:
        </label>
        <CustomSelect<SelectOption>
          inputId="mediateur-filter"
          instanceId="mediateur-filter-search"
          placeholder="Choisir un médiateur numérique"
          className="fr-mb-2v fr-mt-3v"
          options={mediateursOptions.filter(availableOptionsIn(mediateurs))}
          onChange={handleSelectFilter}
          value={[]}
        />
        {hasFilters && (
          <>
            <FilterSelection
              options={mediateurs}
              onRemoveFilter={handleRemoveFilter}
              label={{
                singular: 'médiateur sélectionné',
                plural: 'médiateurs sélectionnés',
              }}
            />
            <FilterFooter onClearFilters={handleClearFilters} />
          </>
        )}
      </form>
    </Popover>
  )
}
