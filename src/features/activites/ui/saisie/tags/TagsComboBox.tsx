import { OptionsData } from '@app/ui/components/Primitives/Options'
import { SelectedItemsData } from '@app/ui/components/Primitives/SelectedItems'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import {
  type Tag,
  tagDuFormulaire,
} from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import { BadgeDePortee } from '@app/web/features/activites/ui/tags/BadgeDePortee'
import { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { inject } from '@app/web/libs/injection/client'

const itemToKey = (item: { id: string }): string => item.id

const onlyDefinedIds = (tag?: { id?: string }): tag is { id: string } =>
  tag?.id != null

const loadSuggestions =
  (selectedTags: ({ id?: string } | undefined)[]) =>
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
    <BadgeDePortee small portee={item.portee} equipe={item.equipe} />
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
