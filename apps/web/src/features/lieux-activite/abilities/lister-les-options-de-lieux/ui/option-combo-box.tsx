import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'

const itemToString = (item: SelectOption | null): string => item?.label ?? ''

const itemToKey = (item: SelectOption): string => item.value

const sansAccent = (texte: string): string =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * Un choix parmi des options déjà chargées.
 *
 * La liste est en mémoire — communes, départements et lieux du médiateur
 * viennent du serveur avec la page — mais elle est longue : la parcourir à la
 * souris est impraticable, d'où le filtrage à la frappe plutôt qu'un simple
 * menu déroulant. On compare sans accents ni casse, parce que personne ne tape
 * « Château-Thierry » avec son accent circonflexe.
 */
export const optionComboBox = (
  options: readonly SelectOption[],
): ComboBoxData<SelectOption> => ({
  itemToString,
  itemToKey,
  loadSuggestions: async (input) => ({
    items: options.filter((option) =>
      sansAccent(option.label).includes(sansAccent(input)),
    ),
  }),
})

export const OptionOptions: OptionsData<SelectOption> = {
  itemToKey,
  renderItem: ({ item }) => <span>{item.label}</span>,
}
