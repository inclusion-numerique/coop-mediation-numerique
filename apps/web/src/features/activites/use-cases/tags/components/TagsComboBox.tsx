import { OptionsData } from '@app/ui/components/Primitives/Options'
import { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { vanillaTrpc } from '@app/web/trpc'
import { TagScope } from '../tagScope'
import TagScopeBadge from './TagScopeBadge'

export type Tag = {
  id: string
  nom: string
  description?: string
  scope: TagScope
}

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (tag?: { id?: string }): tag is { id: string } =>
  tag?.id != null

const loadSuggestions =
  (selectedTags: ({ id?: string } | undefined)[]) =>
  (input: string): Promise<{ items: Tag[] }> =>
    vanillaTrpc.tags.search.query({
      query: input,
      excludeIds: selectedTags.filter(onlyDefinedIds).map(itemToKey),
    })

const itemToString = (item: Tag | null): string => item?.nom ?? ''

const renderItem = ({ item }: { item: Tag }) => (
  <div className="fr-flex fr-direction-row fr-align-items-center fr-justify-content-space-between">
    <div className="fr-flex fr-direction-column">
      {item.nom}
      {!!item.description && (
        <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
          {item.description}
        </span>
      )}
    </div>
    <TagScopeBadge small scope={item.scope} />
  </div>
)

export const TagComboBox = (
  tags: ({ id?: string } | undefined)[] = [],
): ComboBoxData<Tag> => ({
  itemToString,
  loadSuggestions: loadSuggestions(tags),
  itemToKey,
})

export const TagOptions: OptionsData<Tag> = {
  itemToKey,
  renderItem,
}

export const TagSelectedItems: SelectedItemsData<Tag> = {
  itemToString,
  itemToKey,
}
