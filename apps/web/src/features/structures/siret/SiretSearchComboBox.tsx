import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { StructureSearchResult } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

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

  const result = await vanillaTrpc.structures.searchCombined.query({
    query: input,
  })

  return { items: result.structures }
}

const renderItem = ({ item }: { item: StructureSearchResult }) => (
  <div className="fr-flex fr-direction-column">
    <span className="fr-text--bold">{item.nom}</span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.siret} · {item.adresse}, {item.codePostal} {item.commune}
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
