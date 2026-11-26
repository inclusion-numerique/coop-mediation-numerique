'use client'

import { useRef } from 'react'
import { ComboBox, Options, type OptionsData } from '@/libraries/ui/primitives'
import { type DepartementDuReferentiel, departements } from '../departements'
import { rechercherDesDepartements } from '../recherche-de-departements'

const libelleDe = (departement: DepartementDuReferentiel | null): string =>
  departement ? `${departement.nom} · ${departement.code}` : ''

const optionsDesDepartements: OptionsData<DepartementDuReferentiel> = {
  itemToKey: ({ code }) => code,
  renderItem: ({ item }) => libelleDe(item),
}

const chargerLesDepartements = async (
  recherche: string,
): Promise<{ items: DepartementDuReferentiel[] }> => ({
  items: rechercherDesDepartements(recherche),
})

export const ChoixDuDepartement = ({
  libelle,
  indice,
  departement,
  onChoix,
}: {
  libelle: string
  indice?: string
  departement: DepartementDuReferentiel | null
  onChoix: (departement: DepartementDuReferentiel) => void
}) => {
  const champRef = useRef<HTMLDivElement>(null)

  return (
    <ComboBox
      defaultItems={departements}
      {...(departement == null ? {} : { defaultValue: departement })}
      itemToString={libelleDe}
      loadSuggestions={chargerLesDepartements}
      onSelect={onChoix}
    >
      {({
        getLabelProps,
        getToggleButtonProps,
        getInputProps,
        ...optionsProps
      }) => (
        <div className="fr-input-group fr-mb-0">
          <label className="fr-label" {...getLabelProps()}>
            {libelle}
            {indice && <span className="fr-hint-text">{indice}</span>}
          </label>
          <div
            ref={champRef}
            className="fr-input-wrap fr-position-relative fr-flex fr-align-items-center"
          >
            <input
              className="fr-input fr-text--medium fr-pr-10v"
              placeholder="Rechercher un département"
              {...getInputProps()}
            />
            <button
              type="button"
              className="fr-btn fr-btn--tertiary-no-outline fr-position-absolute fr-right-0 fr-mr-1v"
              aria-label="Afficher la liste des départements"
              {...getToggleButtonProps()}
            >
              <span
                className={
                  optionsProps.isOpen
                    ? 'fr-icon-arrow-up-s-line'
                    : 'fr-icon-arrow-down-s-line'
                }
                aria-hidden
              />
            </button>
          </div>
          <Options
            {...optionsProps}
            {...optionsDesDepartements}
            anchorRef={champRef}
            className="fr-index-2000"
          />
        </div>
      )}
    </ComboBox>
  )
}
