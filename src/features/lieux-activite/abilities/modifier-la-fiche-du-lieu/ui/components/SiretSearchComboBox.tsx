import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import type { StructureSearchResult } from '@/features/employeuse'
import { addresseFromParts } from '@/libraries/adresse/addresseFromParts'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'

const itemToString = (item: StructureSearchResult | null): string =>
  item ? `${item.nom} · ${item.siret}` : ''

const itemToKey = (item: StructureSearchResult): string =>
  `${item.siret}-${item.adresse}`

const loadSuggestions = async (
  input: string,
): Promise<{ items: StructureSearchResult[] }> => {
  if (input.length < 3) {
    return { items: [] }
  }

  const resultat = await rechercherStructureEmployeuseAction({ query: input })

  return resultat.success
    ? { items: [...resultat.data.structures] }
    : { items: [] }
}

const renderItem = ({ item }: { item: StructureSearchResult }) => (
  <div className="fr-flex fr-direction-column">
    <span className="fr-text--bold">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {[item.siret, addresseFromParts(item)].filter(Boolean).join(' · ')}
    </span>
  </div>
)

export const SiretSearchComboBox: ComboBoxData<StructureSearchResult> = {
  itemToString,
  itemToKey,
  loadSuggestions,
}

export const SiretSearchOptions: OptionsData<StructureSearchResult> = {
  itemToKey,
  renderItem,
}
