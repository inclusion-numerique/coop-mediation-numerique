import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/action/rechercher-employeuses.key'
import type { OptionDEmployeuse } from '@/features/activites/ui/search-params/filtres-de-la-liste.search-params'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { inject } from '@/libraries/nextjs/injection/client'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'
import type { SelectedItemsData } from '@/libraries/ui/components/Primitives/SelectedItems'

export type StructureEmployeuse = OptionDEmployeuse

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (item?: { id?: string }): item is { id: string } =>
  item?.id != null

const loadSuggestions =
  (selectedStructures: ({ id?: string } | undefined)[]) =>
  async (input: string): Promise<{ items: StructureEmployeuse[] }> => {
    const resultat = await inject(RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY)({
      recherche: input,
      exclues: selectedStructures.filter(onlyDefinedIds).map(itemToKey),
    })

    return { items: resultat.success ? [...resultat.data] : [] }
  }

const itemToString = (item: StructureEmployeuse | null): string =>
  item?.nom ?? ''

const renderItem = ({ item }: { item: StructureEmployeuse }) => (
  <div className="fr-flex fr-direction-column">
    <span>{item.nom}</span>
    {item.commune && (
      <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
        {item.commune}
      </span>
    )}
  </div>
)

export const StructureEmployeuseComboBox = (
  structures: ({ id?: string } | undefined)[] = [],
): ComboBoxData<StructureEmployeuse> => ({
  itemToString,
  loadSuggestions: loadSuggestions(structures),
  itemToKey,
})

export const OptionDEmployeuses: OptionsData<StructureEmployeuse> = {
  itemToKey,
  renderItem,
}

export const StructureEmployeuseSelectedItems: SelectedItemsData<StructureEmployeuse> =
  {
    itemToString,
    itemToKey,
  }
