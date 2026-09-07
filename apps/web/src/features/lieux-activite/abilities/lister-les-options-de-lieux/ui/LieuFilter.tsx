'use client'

import {
  labelsToOptions,
  SelectOption,
} from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { locationTypeLabels } from '@app/web/features/activites/use-cases/list/components/generateActivitesFiltersLabels'
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
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { OptionOptions, optionComboBox } from './option-combo-box'

export type LieuFilterType = 'lieu' | 'commune' | 'departement'
export type LieuFilterValue = { type: LieuFilterType; value: string[] }

const lieuTypeOptions = labelsToOptions(locationTypeLabels)
const lieuTypeOptionsWithoutDepartement = lieuTypeOptions.filter(
  (option) => option.value !== 'departement',
)

const lieuPlaceholder: Record<LieuFilterType, string> = {
  lieu: 'Choisir un lieu d’activité',
  commune: 'Choisir une commune',
  departement: 'Choisir un département',
}

export const LieuFilter = ({
  defaultValue = [],
  communesOptions = [],
  departementsOptions = [],
  lieuxActiviteOptions = [],
}: {
  defaultValue?: LieuFilterValue[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: SelectOption[]
  departementsOptions: SelectOption[] | null // if null, disables the departements filter
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)
  const champRef = useRef<HTMLDivElement>(null)

  /**
   * Deux champs transitoires : le type de localisation, puis la valeur choisie
   * dans la liste correspondante. Ni l'un ni l'autre n'est soumis — ce sont les
   * sélections accumulées qui partent dans l'URL — mais ils passent par le
   * formulaire pour bénéficier des composants de champ de l'application.
   */
  const form = useAppForm({
    defaultValues: { type: '', valeur: null as SelectOption | null },
  })

  const lieuFilterType = useSelector(
    form.store,
    (state) => state.values.type,
  ) as LieuFilterType | ''

  const isPending = !useHydrated()

  const defaultValueSet = new Set(defaultValue.flatMap(({ value }) => value))

  const filteredCommunesOptions = communesOptions.filter(
    defautValuesFrom(defaultValueSet),
  )

  const filteredDepartementsOptions =
    departementsOptions?.filter(defautValuesFrom(defaultValueSet)) ?? []

  const filteredLieuxActiviteOptions = lieuxActiviteOptions.filter(
    defautValuesFrom(defaultValueSet),
  )

  const [communes, setCommunes] = useState(filteredCommunesOptions)
  const [departements, setDepartements] = useState(filteredDepartementsOptions)
  const [lieuxActivite, setLieuxActivite] = useState(
    filteredLieuxActiviteOptions,
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to trigger when props options change
  useEffect(() => {
    setCommunes(filteredCommunesOptions)
    setDepartements(filteredDepartementsOptions)
    setLieuxActivite(filteredLieuxActiviteOptions)
  }, [communesOptions, departementsOptions, lieuxActiviteOptions])

  const allFilters = [...departements, ...communes, ...lieuxActivite]
  const hasFilters = allFilters.length > 0

  const optionsForType: Record<LieuFilterType, SelectOption[]> = {
    commune: communesOptions.filter(availableOptionsIn(communes)),
    departement:
      departementsOptions?.filter(availableOptionsIn(departements)) ?? [],
    lieu: lieuxActiviteOptions.filter(availableOptionsIn(lieuxActivite)),
  }

  const closePopover = (close: boolean = false) => {
    form.setFieldValue('type', '')
    form.setFieldValue('valeur', null)
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    update(params)('lieux', lieuxActivite)
    update(params)('communes', communes)
    update(params)('departements', departements)
    resetPagination(params)

    closePopover(close)
  }

  const handleClearFilters = () => {
    setCommunes([])
    setDepartements([])
    setLieuxActivite([])

    update(params)('lieux', [])
    update(params)('communes', [])
    update(params)('departements', [])
    resetPagination(params)

    closePopover(true)
  }

  const handleSelectFilter = (option: SelectOption) => {
    if (!lieuFilterType) return
    const setState = {
      commune: setCommunes,
      departement: setDepartements,
      lieu: setLieuxActivite,
    }[lieuFilterType]
    setState((prev) => [...prev, option])

    // Le champ se vide au tour suivant, et non tout de suite : la combo pose sa
    // propre valeur juste avant d'appeler ce gestionnaire, et le composant ne se
    // réinitialise qu'au changement de clé. Remettre à zéro dans le même tour ne
    // ferait donc pas varier la clé — le libellé choisi resterait affiché.
    queueMicrotask(() => form.setFieldValue('valeur', null))
  }

  const handleRemoveFilter = (option: SelectOption) => {
    setCommunes(communes.filter(matchingOption(option)))
    setDepartements(departements.filter(matchingOption(option)))
    setLieuxActivite(lieuxActivite.filter(matchingOption(option)))
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Lieu{hasFilters && <>&nbsp;·&nbsp;{allFilters.length}</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <label
          className="fr-label fr-mb-1v fr-text--bold"
          htmlFor="lieu-filter"
        >
          Filtrer par&nbsp;:
        </label>
        <form.AppForm>
          <form.AppField name="type">
            {(field) => (
              <field.Select
                isPending={isPending}
                label=""
                className="fr-mb-2v fr-mt-3v"
                placeholder="Choisir un type de localisation"
                options={
                  departementsOptions
                    ? lieuTypeOptions
                    : lieuTypeOptionsWithoutDepartement
                }
              />
            )}
          </form.AppField>

          {lieuFilterType && (
            <form.AppField name="valeur">
              {(field) => (
                <field.ComboBox
                  isPending={isPending}
                  onSelect={handleSelectFilter}
                  // Le bouton déroule la liste entière ; la frappe la filtre.
                  // Sans ces items par défaut, ouvrir le champ ne montrerait
                  // rien tant qu'on n'a pas tapé.
                  defaultItems={[...optionsForType[lieuFilterType]]}
                  {...optionComboBox(optionsForType[lieuFilterType])}
                >
                  {({
                    getLabelProps,
                    getInputProps,
                    getToggleButtonProps,
                    ...optionsProps
                  }) => (
                    <>
                      <div ref={champRef}>
                        <field.Input
                          addonEnd={
                            <Button
                              title="Voir la liste"
                              className="fr-border-left-0"
                              iconId="fr-icon-arrow-down-s-line"
                              {...getToggleButtonProps({ type: 'button' })}
                            />
                          }
                          isConnected={false}
                          isPending={isPending}
                          nativeLabelProps={getLabelProps()}
                          nativeInputProps={{
                            ...getInputProps(),
                            placeholder: lieuPlaceholder[lieuFilterType],
                          }}
                          label=""
                        />
                      </div>
                      <Options
                        {...optionsProps}
                        {...OptionOptions}
                        anchorRef={champRef}
                        className="fr-index-2000"
                      />
                    </>
                  )}
                </field.ComboBox>
              )}
            </form.AppField>
          )}
        </form.AppForm>

        {hasFilters && (
          <>
            <FilterSelection
              options={allFilters}
              onRemoveFilter={handleRemoveFilter}
              label={{
                singular: 'lieu sélectionné',
                plural: 'lieux sélectionnés',
              }}
            />
            <FilterFooter onClearFilters={handleClearFilters} />
          </>
        )}
      </form>
    </Popover>
  )
}
