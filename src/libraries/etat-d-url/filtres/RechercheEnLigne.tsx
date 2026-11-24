'use client'

import { useStore } from '@tanstack/react-form'
import type { ParserMap } from 'nuqs'
import { useRef } from 'react'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { useHydrated } from '@/libraries/formulaire/use-hydrated'
import type { SelectOption } from '@/libraries/ui/form/utils/options'
import { Options } from '@/libraries/ui/primitives/Options'
import type { FiltreQuelconque } from '../definition/filtre'
import {
  comboBoxDeRecherche,
  messageDeLaRecherche,
  OptionsDeRecherche,
  type Rechercher,
} from './combo-box-de-recherche'
import { useChampDeFiltre } from './conteneur-de-filtres'
import { FilterSelection } from './FilterSelection'
import { useFiltre } from './use-filtre'

export const RechercheEnLigne = ({
  filtre,
  libelle,
  placeholder,
  selection,
  rechercher,
  choisies: choisiesAuDepart,
  suggestions = [],
  longueurMinimale = 3,
}: {
  filtre: FiltreQuelconque & { readonly cle: string }
  libelle: string
  placeholder: string
  selection: { singular: string; plural: string }
  rechercher: Rechercher
  choisies: readonly SelectOption[]
  suggestions?: readonly SelectOption[]
  longueurMinimale?: number
}) => {
  const [, ecrire] = useFiltre<ParserMap>(filtre.parametres)
  const champRef = useRef<HTMLDivElement>(null)
  const enAttente = !useHydrated()
  const form = useAppForm({
    defaultValues: { choix: [...choisiesAuDepart] },
  })
  const choisies = useStore(form.store, (etat) => etat.values.choix)

  const enUrl = (options: readonly SelectOption[]) => ({
    [filtre.cle]: options.map(({ value }) => value),
  })

  useChampDeFiltre({
    valider: () => ecrire(enUrl(choisies)),
    effacer: () => ecrire(enUrl([])),
  })

  return (
    <>
      <form.AppForm>
        <form.AppField name="choix">
          {(field) => (
            <field.ComboBox
              isPending={enAttente}
              defaultItems={[...suggestions]}
              {...comboBoxDeRecherche(
                rechercher,
                () => choisies,
                longueurMinimale,
                suggestions,
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
                      nativeInputProps={{ ...getInputProps(), placeholder }}
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
        <FilterSelection
          options={[...choisies]}
          onRemoveFilter={({ value }) =>
            form.setFieldValue(
              'choix',
              choisies.filter((option) => option.value !== value),
            )
          }
          label={selection}
        />
      )}
    </>
  )
}
