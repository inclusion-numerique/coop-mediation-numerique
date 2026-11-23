'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FilterFooter } from '@/libraries/filtres/FilterFooter'
import { FilterSelection } from '@/libraries/filtres/FilterSelection'
import {
  matchingOption,
  resetPagination,
  update,
} from '@/libraries/filtres/helpers'
import TriggerButton from '@/libraries/filtres/TriggerButton'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { useHydrated } from '@/libraries/formulaire/use-hydrated'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { Options } from '@/libraries/ui/components/Primitives/Options'
import { Popover } from '@/libraries/ui/components/Primitives/Popover'
import {
  comboBoxDeRecherche,
  messageDeLaRecherche,
  OptionsDeRecherche,
  type Rechercher,
} from './combo-box-de-recherche'

const aucune = (): SelectOption | null => null

export const FiltreARecherche = ({
  parametre,
  titre,
  libelle,
  placeholder,
  selection,
  rechercher,
  initiales,
  longueurMinimale = 3,
}: {
  parametre: string
  titre: string
  libelle: string
  placeholder: string
  selection: { singular: string; plural: string }
  rechercher: Rechercher
  initiales: readonly SelectOption[]
  longueurMinimale?: number
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ouvert, setOuvert] = useState(false)
  const [choisies, setChoisies] = useState(initiales)
  const champRef = useRef<HTMLDivElement>(null)
  const enAttente = !useHydrated()

  useEffect(() => setChoisies(initiales), [initiales])

  const form = useAppForm({ defaultValues: { choix: aucune() } })

  const appliquer = (
    selectionnees: readonly SelectOption[],
    fermer = false,
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    update(params)(parametre, [...selectionnees])
    resetPagination(params)
    if (fermer) setOuvert(false)
    form.setFieldValue('choix', null)
    router.replace(`?${params}`, { scroll: false })
  }

  const choisir = (option: SelectOption) => {
    const selectionnees = [...choisies, option]
    setChoisies(selectionnees)
    queueMicrotask(() => appliquer(selectionnees))
  }

  const retirer = (option: SelectOption) => {
    const restantes = choisies.filter(matchingOption(option))
    setChoisies(restantes)
    appliquer(restantes)
  }

  const effacer = () => {
    setChoisies([])
    appliquer([], true)
  }

  return (
    <Popover
      open={ouvert}
      onOpenChange={setOuvert}
      onInteractOutside={() => appliquer(choisies)}
      onEscapeKeyDown={() => appliquer(choisies)}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={choisies.length > 0}>
          {titre}
          {choisies.length > 0 && <>&nbsp;·&nbsp;{choisies.length}</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => appliquer(choisies, true)}>
        <form.AppForm>
          <form.AppField name="choix">
            {(field) => (
              <field.ComboBox
                isPending={enAttente}
                onSelect={choisir}
                {...comboBoxDeRecherche(
                  rechercher,
                  () => choisies,
                  longueurMinimale,
                )}
              >
                {({
                  getLabelProps,
                  getInputProps,
                  getToggleButtonProps: _,
                  payload,
                  ...optionsProps
                }) => (
                  <>
                    <div ref={champRef}>
                      <field.Input
                        isConnected={false}
                        isPending={enAttente}
                        nativeLabelProps={getLabelProps()}
                        nativeInputProps={{
                          ...getInputProps(),
                          placeholder,
                        }}
                        label={libelle}
                      />
                    </div>
                    <Options
                      {...optionsProps}
                      {...OptionsDeRecherche}
                      showEmpty={payload.etat !== undefined}
                      anchorRef={champRef}
                      className="fr-index-2000"
                    >
                      {payload.etat === undefined ? null : (
                        <span className="fr-text-mention--grey">
                          {messageDeLaRecherche(payload.etat, longueurMinimale)}
                        </span>
                      )}
                    </Options>
                  </>
                )}
              </field.ComboBox>
            )}
          </form.AppField>
        </form.AppForm>
        {choisies.length > 0 && (
          <>
            <FilterSelection
              options={[...choisies]}
              onRemoveFilter={retirer}
              label={selection}
            />
            <FilterFooter onClearFilters={effacer} />
          </>
        )}
      </form>
    </Popover>
  )
}
