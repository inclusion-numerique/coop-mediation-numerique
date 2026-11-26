'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import {
  type DepartementDuReferentiel,
  departements,
} from '@/libraries/departement'
import { ComboBox, Options, type OptionsData } from '@/libraries/ui/primitives'
import { hrefDuReseau } from '../../../../ui/presenters/liens.presenter'

const itemToString = (departement: DepartementDuReferentiel | null): string =>
  departement ? `${departement.nom} · ${departement.code}` : ''

const optionsDesDepartements: OptionsData<DepartementDuReferentiel> = {
  itemToKey: ({ code }) => code,
  renderItem: ({ item }) => itemToString(item),
}

const normalizeForSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-']/g, '')

const filterDepartements = (inputValue: string): DepartementDuReferentiel[] => {
  const normalizedInput = normalizeForSearch(inputValue)
  return departements.filter(
    (departement) =>
      normalizeForSearch(departement.nom).includes(normalizedInput) ||
      departement.code.toLowerCase().includes(normalizedInput),
  )
}

const loadSuggestions = async (
  inputValue: string,
): Promise<{ items: DepartementDuReferentiel[] }> => ({
  items: filterDepartements(inputValue),
})

const DepartementComboBox = ({
  defaultDepartement,
}: {
  defaultDepartement: DepartementDuReferentiel
}) => {
  const router = useRouter()
  const champRef = useRef<HTMLDivElement>(null)

  const handleSelect = (departement: DepartementDuReferentiel) => {
    router.push(hrefDuReseau(departement.code))
  }

  return (
    <ComboBox
      defaultItems={departements}
      defaultValue={defaultDepartement}
      itemToString={itemToString}
      loadSuggestions={loadSuggestions}
    >
      {({
        getToggleButtonProps,
        getInputProps,
        getItemProps,
        ...optionsProps
      }) => (
        <>
          <div
            ref={champRef}
            className="fr-position-relative fr-flex fr-align-items-center"
          >
            <input
              className="fr-input fr-text--medium fr-pr-10v"
              placeholder="Rechercher un département..."
              {...getInputProps({})}
            />
            <button
              type="button"
              className="fr-btn fr-btn--tertiary-no-outline fr-position-absolute fr-right-0 fr-mr-1v"
              aria-label="Ouvrir la liste des départements"
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
            getItemProps={({ item, index }) =>
              getItemProps({ item, index, onClick: () => handleSelect(item) })
            }
            anchorRef={champRef}
            className="fr-index-2000"
          />
        </>
      )}
    </ComboBox>
  )
}

export default DepartementComboBox
