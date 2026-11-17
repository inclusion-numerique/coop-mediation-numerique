'use client'

import {
  labelsToOptions,
  type SelectOption,
} from '@app/ui/components/Form/utils/options'
import {
  Options,
  type OptionsData,
} from '@app/ui/components/Primitives/Options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import { FilterSelection } from '@app/web/libs/filters/FilterSelection'
import {
  availableOptionsIn,
  matchingOption,
  resetPagination,
  update,
} from '@app/web/libs/filters/helpers'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { LieuxChoisisDeLaBarre } from './lieux-choisis'
import {
  type GenreDuFiltreDeLieu,
  RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY,
} from './rechercher-les-lieux-des-statistiques.key'

type TypeDeLieu = 'lieu' | 'commune' | 'departement'

const libellesDesTypesDeLieu: Record<TypeDeLieu, string> = {
  lieu: 'Lieu d’activité',
  commune: 'Commune',
  departement: 'Département',
}

const GENRE_DU_TYPE: Record<TypeDeLieu, GenreDuFiltreDeLieu> = {
  lieu: 'LieuDActivite',
  commune: 'Commune',
  departement: 'Departement',
}

const typesDeLieu = labelsToOptions(libellesDesTypesDeLieu)

const lieuPlaceholder: Record<TypeDeLieu, string> = {
  lieu: 'Choisir un lieu d’activité',
  commune: 'Choisir une commune',
  departement: 'Choisir un département',
}

type ChampsDuFiltre = { type: TypeDeLieu | ''; valeur: SelectOption | null }

const champsVides: ChampsDuFiltre = { type: '', valeur: null }

const rechercher = async (
  type: TypeDeLieu,
  recherche: string,
): Promise<SelectOption[]> =>
  inject(RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY)({
    genre: GENRE_DU_TYPE[type],
    recherche,
  })
    .then((resultat) => (resultat.success ? [...resultat.data] : []))
    .catch(() => [])

const itemToKey = (item: SelectOption): string => item.value

const suggestionsDe = (
  type: TypeDeLieu,
  dejaChoisis: SelectOption[],
): ComboBoxData<SelectOption> => ({
  itemToString: (item) => item?.label ?? '',
  itemToKey,
  loadSuggestions: async (saisie) => ({
    items: (await rechercher(type, saisie)).filter(
      availableOptionsIn(dejaChoisis),
    ),
  }),
})

const optionsAffichees: OptionsData<SelectOption> = {
  itemToKey,
  renderItem: ({ item }) => <span>{item.label}</span>,
}

export const FiltreDeLieu = ({
  choisis,
}: {
  choisis: LieuxChoisisDeLaBarre
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)
  const champRef = useRef<HTMLDivElement>(null)

  const form = useAppForm({ defaultValues: champsVides })
  const type = useSelector(form.store, (state) => state.values.type)
  const isPending = !useHydrated()

  const [communes, setCommunes] = useState(choisis.communesOptions)
  const [departements, setDepartements] = useState(choisis.departementsOptions)
  const [lieuxActivite, setLieuxActivite] = useState(
    choisis.lieuxActiviteOptions,
  )
  const [choisisSynchronises, setChoisisSynchronises] = useState(choisis)

  if (choisisSynchronises !== choisis) {
    setChoisisSynchronises(choisis)
    setCommunes(choisis.communesOptions)
    setDepartements(choisis.departementsOptions)
    setLieuxActivite(choisis.lieuxActiviteOptions)
  }

  const [plusUtilises, setPlusUtilises] = useState<
    Partial<Record<TypeDeLieu, SelectOption[]>>
  >({})

  useEffect(() => {
    if (type === '') return
    rechercher(type, '').then((options) =>
      setPlusUtilises((precedents) => ({ ...precedents, [type]: options })),
    )
  }, [type])

  const plusUtilisesDuType = type === '' ? [] : (plusUtilises[type] ?? [])

  const choisisDuType: Record<TypeDeLieu, SelectOption[]> = {
    lieu: lieuxActivite,
    commune: communes,
    departement: departements,
  }

  const tousLesChoisis = [...departements, ...communes, ...lieuxActivite]
  const aDesChoix = tousLesChoisis.length > 0

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
    if (type === '') return
    const ajouter = {
      commune: setCommunes,
      departement: setDepartements,
      lieu: setLieuxActivite,
    }[type]
    ajouter((precedents) => [...precedents, option])
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
        <TriggerButton isOpen={isOpen} isFilled={aDesChoix}>
          Lieu{aDesChoix && <>&nbsp;·&nbsp;{tousLesChoisis.length}</>}
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
                options={typesDeLieu}
              />
            )}
          </form.AppField>

          {type !== '' && (
            <form.AppField name="valeur">
              {(field) => (
                <field.ComboBox
                  key={`${type}-${plusUtilisesDuType.map(itemToKey).join()}`}
                  isPending={isPending}
                  onSelect={handleSelectFilter}
                  defaultItems={plusUtilisesDuType.filter(
                    availableOptionsIn(choisisDuType[type]),
                  )}
                  {...suggestionsDe(type, choisisDuType[type])}
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
                            placeholder: lieuPlaceholder[type],
                          }}
                          label=""
                        />
                      </div>
                      <Options
                        {...optionsProps}
                        {...optionsAffichees}
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

        {aDesChoix && (
          <>
            <FilterSelection
              options={tousLesChoisis}
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
