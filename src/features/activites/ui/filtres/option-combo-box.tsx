import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import type { OptionsData } from '@/libraries/ui/components/Primitives/Options'

const itemToString = (item: SelectOption | null): string => item?.label ?? ''

const itemToKey = (item: SelectOption): string => item.value

const sansAccent = (texte: string): string =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

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
