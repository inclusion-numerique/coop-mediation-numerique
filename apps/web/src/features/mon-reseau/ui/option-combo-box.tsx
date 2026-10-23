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

export const optionsFiltrees = (
  options: readonly SelectOption[],
  saisie: string,
): SelectOption[] =>
  options.filter((option) =>
    sansAccent(option.label).includes(sansAccent(saisie)),
  )

export const optionComboBox = (
  options: readonly SelectOption[],
): ComboBoxData<SelectOption> => ({
  itemToString,
  itemToKey,
  loadSuggestions: async (saisie) => ({
    items: optionsFiltrees(options, saisie),
  }),
})

export const OptionOptions: OptionsData<SelectOption> = {
  itemToKey,
  renderItem: ({ item }) => <span>{item.label}</span>,
}
