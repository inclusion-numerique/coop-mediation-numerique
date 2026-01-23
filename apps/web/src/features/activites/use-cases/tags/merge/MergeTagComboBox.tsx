import { OptionsData } from '@app/ui/components/Primitives/Options'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'
import { TagItem, TagItemProps } from '../components/TagItem'

export type MergeDestinationTag = Omit<TagItemProps, 'actions' | 'small'>

const itemToKey = (item: { id: string }): string => item.id

const loadSuggestions =
  (sourceTagId: string) =>
  (input: string): Promise<{ items: MergeDestinationTag[] }> =>
    vanillaTrpc.tags.searchMergeDestinations.query({
      sourceTagId,
      query: input,
    })

const itemToString = (item: MergeDestinationTag | null): string =>
  item?.nom ?? ''

export const renderItem = ({ item }: { item: MergeDestinationTag }) => (
  <TagItem {...item} small />
)

export const MergeTagComboBox = (
  sourceTagId: string,
): ComboBoxData<MergeDestinationTag> => ({
  itemToString,
  loadSuggestions: loadSuggestions(sourceTagId),
  itemToKey,
})

export const MergeTagOptions: OptionsData<MergeDestinationTag> = {
  itemToKey,
  renderItem,
}
