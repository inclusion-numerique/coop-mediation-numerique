'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import { FilterSelection } from '@app/web/libs/filters/FilterSelection'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { OptionOptions, optionComboBox } from './option-combo-box'

const retenues = (
  options: readonly SelectOption[],
  valeurs: readonly string[],
): SelectOption[] => options.filter(({ value }) => valeurs.includes(value))

export const FiltreCommune = ({
  defaultValue = [],
  communesOptions = [],
}: {
  defaultValue?: string[]
  communesOptions: SelectOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const champRef = useRef<HTMLDivElement>(null)
  const [ouvert, ouvrir] = useState(false)
  const [communes, choisir] = useState(retenues(communesOptions, defaultValue))
  const enAttente = !useHydrated()

  const form = useAppForm({
    defaultValues: { commune: null as SelectOption | null },
  })

  const disponibles = communesOptions.filter(
    ({ value }) => !communes.some((commune) => commune.value === value),
  )

  const appliquer = (choisies: readonly SelectOption[], fermer: boolean) => {
    const autres = [...searchParams.entries()].filter(
      ([nom]) => nom !== 'communes' && nom !== 'page',
    )
    const params = new URLSearchParams(
      choisies.length === 0
        ? autres
        : [
            ...autres,
            ['communes', choisies.map(({ value }) => value).join(',')],
          ],
    )
    if (fermer) ouvrir(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const ajouter = (option: SelectOption) => {
    choisir((precedentes) => [...precedentes, option])
    queueMicrotask(() => form.setFieldValue('commune', null))
  }

  const retirer = (option: SelectOption) =>
    choisir(communes.filter(({ value }) => value !== option.value))

  const effacer = () => {
    choisir([])
    appliquer([], true)
  }

  return (
    <Popover
      open={ouvert}
      onOpenChange={ouvrir}
      onInteractOutside={() => appliquer(communes, false)}
      onEscapeKeyDown={() => appliquer(communes, false)}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={communes.length > 0}>
          Commune
          {communes.length > 0 && <>&nbsp;·&nbsp;{communes.length}</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => appliquer(communes, true)}>
        <p className="fr-label fr-mb-1v fr-text--bold">
          Filtrer par commune&nbsp;:
        </p>
        <form.AppForm>
          <form.AppField name="commune">
            {(field) => (
              <field.ComboBox
                isPending={enAttente}
                onSelect={ajouter}
                defaultItems={disponibles}
                {...optionComboBox(disponibles)}
              >
                {({
                  getLabelProps,
                  getInputProps,
                  getToggleButtonProps,
                  ...optionsProps
                }) => (
                  <>
                    <div ref={champRef} className="fr-mt-3v fr-mb-2v">
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
                        isPending={enAttente}
                        nativeLabelProps={getLabelProps()}
                        nativeInputProps={{
                          ...getInputProps(),
                          placeholder: 'Sélectionner une commune',
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
        </form.AppForm>
        {communes.length > 0 && (
          <>
            <FilterSelection
              options={communes}
              onRemoveFilter={retirer}
              label={{
                singular: 'commune sélectionnée',
                plural: 'communes sélectionnées',
              }}
            />
            <FilterFooter onClearFilters={effacer} />
          </>
        )}
      </form>
    </Popover>
  )
}
