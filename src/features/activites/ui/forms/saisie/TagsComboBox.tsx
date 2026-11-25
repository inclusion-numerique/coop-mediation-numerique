import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import {
  type Tag,
  tagDuFormulaire,
} from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import { ComboBoxData } from '@/libraries/formulaire/fields-components'
import { inject } from '@/libraries/nextjs/injection'
import { BadgeAvecInfobulle } from '@/libraries/ui/components'
import { OptionsData, SelectedItemsData } from '@/libraries/ui/primitives'

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (tag?: {
  id?: string | undefined
}): tag is { id: string } => tag?.id != null

const loadSuggestions =
  (selectedTags: ({ id?: string | undefined } | undefined)[]) =>
  async (input: string): Promise<{ items: Tag[] }> => {
    const resultat = await inject(RECHERCHER_DES_TAGS_DU_CRA_KEY)({
      recherche: input,
      exclus: selectedTags.filter(onlyDefinedIds).map(itemToKey),
    })
    return { items: resultat.success ? resultat.data.map(tagDuFormulaire) : [] }
  }

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
    <BadgeAvecInfobulle small {...item.badge} />
  </div>
)

export const TagComboBox = (
  tags: ({ id?: string | undefined } | undefined)[] = [],
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
