'use client'

import { ComboBox } from '@app/ui/components/Primitives/Form/ComboBox'
import {
  Departement,
  departements,
} from '@app/web/data/collectivites-territoriales/departements'
import { useRouter } from 'next/navigation'

const itemToString = (departement: Departement | null): string =>
  departement ? `${departement.nom} · ${departement.code}` : ''

/**
 * Normalize string for search: lowercase, remove accents and dashes
 */
const normalizeForSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[-']/g, '') // Remove dashes and apostrophes

const filterDepartements = (inputValue: string): Departement[] => {
  const normalizedInput = normalizeForSearch(inputValue)
  return departements.filter(
    (departement) =>
      normalizeForSearch(departement.nom).includes(normalizedInput) ||
      departement.code.toLowerCase().includes(normalizedInput),
  )
}

const loadSuggestions = async (
  inputValue: string,
): Promise<{ items: Departement[] }> => ({
  items: filterDepartements(inputValue),
})

const DepartementComboBox = ({
  defaultDepartement,
}: {
  defaultDepartement: Departement
}) => {
  const router = useRouter()

  const handleSelect = (departement: Departement) => {
    router.push(`/coop/mon-reseau/${departement.code}`)
  }

  return (
    <ComboBox
      defaultItems={departements}
      defaultValue={defaultDepartement}
      itemToString={itemToString}
      loadSuggestions={loadSuggestions}
    >
      {({
        isOpen,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        getItemProps,
        highlightedItem,
        items,
      }) => (
        <div className="fr-position-relative">
          <div className="fr-flex fr-align-items-center">
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
                  isOpen
                    ? 'fr-icon-arrow-up-s-line'
                    : 'fr-icon-arrow-down-s-line'
                }
                aria-hidden
              />
            </button>
          </div>
          <ul
            className={`fr-position-absolute fr-background-default--grey fr-border fr-border-radius--8 fr-p-0 fr-m-0 fr-width-full fr-z-index-3 ${
              isOpen && items.length > 0 ? '' : 'fr-hidden'
            }`}
            style={{ maxHeight: '300px', overflowY: 'auto', listStyle: 'none' }}
            {...getMenuProps()}
          >
            {isOpen &&
              items.map((item, index) => (
                <li
                  key={item.code}
                  className={`fr-px-3v fr-py-2v fr-cursor-pointer ${
                    highlightedItem?.code === item.code
                      ? 'fr-background-alt--blue-france'
                      : ''
                  }`}
                  {...getItemProps({ item, index })}
                  onClick={() => handleSelect(item)}
                >
                  {itemToString(item)}
                </li>
              ))}
          </ul>
        </div>
      )}
    </ComboBox>
  )
}

export default DepartementComboBox
