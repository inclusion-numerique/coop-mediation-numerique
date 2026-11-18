import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { typologieStructureLibelle } from '@/features/employeuse/domain/typologieStructure'
import { addresseFromParts } from '@/libraries/adresse/addresseFromParts'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'
import type { StructureSearchResult } from '../domain/employeuse-choisie'

/**
 * Le SIRET identifie le choix : c'est la clé que les deux sources — structures
 * enregistrées et annuaire des entreprises — ont en commun.
 */
const itemToKey = (item: StructureSearchResult): string => item.siret

const itemToString = (item: StructureSearchResult | null): string =>
  item?.nom ?? ''

/**
 * L'annuaire des entreprises peut être indisponible : la recherche se rabat
 * alors sur les seules structures déjà enregistrées, et l'appelant en est
 * averti pour le dire à l'utilisateur.
 */
const loadSuggestions =
  (onApiUnavailable: (indisponible: boolean) => void) =>
  async (input: string): Promise<{ items: StructureSearchResult[] }> => {
    const result = await rechercherStructureEmployeuseAction({ query: input })

    if (!result.success) return { items: [] }

    onApiUnavailable(result.data.apiUnavailable)

    return { items: result.data.structures }
  }

const renderItem = ({ item }: { item: StructureSearchResult }) => (
  <>
    <span className="fr-display-block fr-text--sm fr-mb-0">{item.nom}</span>
    <span className="fr-display-block fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.typologie
        ? `${typologieStructureLibelle(item.typologie)} · `
        : null}
      {addresseFromParts(item)}
    </span>
  </>
)

export const StructureEmployeuseComboBox = (
  onApiUnavailable: (indisponible: boolean) => void,
): ComboBoxData<StructureSearchResult> => ({
  itemToString,
  itemToKey,
  loadSuggestions: loadSuggestions(onApiUnavailable),
})

export const StructureEmployeuseOptions: OptionsData<StructureSearchResult> = {
  itemToKey,
  renderItem,
}
