import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import type { StructureEmployeuseOption } from '@app/web/features/structures/getStructuresEmployeusesOptions'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'

export type StructureEmployeuse = StructureEmployeuseOption

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (item?: { id?: string }): item is { id: string } =>
  item?.id != null

const loadSuggestions =
  (
    mediateurIds: string[],
    selectedStructures: ({ id?: string } | undefined)[],
  ) =>
  (input: string): Promise<{ items: StructureEmployeuse[] }> =>
    vanillaTrpc.structures.searchStructuresEmployeuses.query({
      query: input,
      mediateurIds,
      excludeIds: selectedStructures.filter(onlyDefinedIds).map(itemToKey),
    })

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
  mediateurIds: string[],
  structures: ({ id?: string } | undefined)[] = [],
): ComboBoxData<StructureEmployeuse> => ({
  itemToString,
  loadSuggestions: loadSuggestions(mediateurIds, structures),
  itemToKey,
})

export const StructureEmployeuseOptions: OptionsData<StructureEmployeuse> = {
  itemToKey,
  renderItem,
}

export const StructureEmployeuseSelectedItems: SelectedItemsData<StructureEmployeuse> =
  {
    itemToString,
    itemToKey,
  }
