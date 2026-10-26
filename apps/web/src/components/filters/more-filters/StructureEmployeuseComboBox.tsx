import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import type { StructureEmployeuseOption } from '@app/web/features/activites/use-cases/list/db/getStructuresEmployeusesOptions'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { inject } from '@app/web/libs/injection/client'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from './rechercher-employeuses-des-activites.key'

export type StructureEmployeuse = StructureEmployeuseOption

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (item?: { id?: string }): item is { id: string } =>
  item?.id != null

const loadSuggestions =
  (selectedStructures: ({ id?: string } | undefined)[]) =>
  async (input: string): Promise<{ items: StructureEmployeuse[] }> => {
    const resultat = await inject(
      RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY,
    )({
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

export const StructureEmployeuseOptions: OptionsData<StructureEmployeuse> = {
  itemToKey,
  renderItem,
}

export const StructureEmployeuseSelectedItems: SelectedItemsData<StructureEmployeuse> =
  {
    itemToString,
    itemToKey,
  }
