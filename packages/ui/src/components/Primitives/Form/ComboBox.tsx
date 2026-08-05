import {
  type Overwrite,
  type UseComboboxGetItemPropsOptions,
  type UseComboboxGetItemPropsReturnValue,
  type UseComboboxReturnValue,
  useCombobox,
} from 'downshift'
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'

export type ComboBoxData<TItem, TPayload = {}> = {
  itemToString: (item: TItem | null) => string
  beforeLoadSuggestions?: (inputValue: string) => Partial<TPayload>
  loadSuggestions: (
    inputValue: string,
  ) => Promise<{ items: TItem[] } & TPayload>
}

export type ComboBoxProps<TItem, TPayload extends object> = {
  defaultItems?: TItem[]
  defaultValue?: Partial<TItem>
  clearOnSelect?: boolean
  children: (props: {
    getLabelProps: UseComboboxReturnValue<TItem>['getLabelProps']
    getMenuProps: UseComboboxReturnValue<TItem>['getMenuProps']
    getToggleButtonProps: UseComboboxReturnValue<TItem>['getToggleButtonProps']
    getInputProps: UseComboboxReturnValue<TItem>['getInputProps']
    // downshift 9.4 type `getItemProps` comme une signature générique dont le type de retour
    // dépend des options reçues. Un consommateur qui l'enveloppe — pour greffer son propre
    // `onClick` — ré-instancie ce générique et ne peut alors plus satisfaire la signature
    // d'origine. On expose donc ici le contrat réellement utilisé : des options de combobox
    // en entrée, les props à étaler sur l'élément de liste en sortie.
    getItemProps: (
      options?: UseComboboxGetItemPropsOptions<TItem>,
    ) => Omit<
      Overwrite<
        UseComboboxGetItemPropsReturnValue,
        UseComboboxGetItemPropsOptions<TItem>
      >,
      'index' | 'item'
    >
    inputValue: UseComboboxReturnValue<TItem>['inputValue']
    setInputValue: UseComboboxReturnValue<TItem>['setInputValue']
    isOpen: boolean
    selectedItem: TItem | null
    highlightedItem: TItem | null
    items: TItem[]
    setItems: Dispatch<SetStateAction<TItem[]>>
    payload: Omit<TPayload, 'items'>
  }) => ReactNode
} & ComboBoxData<TItem, TPayload>

export const ComboBox = <TItem, TPayload extends object>({
  defaultItems = [],
  defaultValue,
  beforeLoadSuggestions,
  loadSuggestions,
  itemToString,
  clearOnSelect = false,
  children,
}: ComboBoxProps<TItem, TPayload>) => {
  const [items, setItems] = useState<TItem[]>(defaultItems)
  const [payload, setPayload] = useState<TPayload>({} as TPayload)

  const {
    getLabelProps,
    getInputProps,
    getMenuProps,
    getToggleButtonProps,
    getItemProps,
    setInputValue,
    inputValue,
    isOpen,
    selectedItem,
    highlightedIndex,
  } = useCombobox({
    onInputValueChange: async ({
      inputValue,
    }: {
      inputValue: string
    }): Promise<void> => {
      setPayload((prevState: TPayload) => ({
        ...prevState,
        ...beforeLoadSuggestions?.(inputValue),
      }))
      const { items: newItems, ...newPayload } =
        await loadSuggestions(inputValue)
      setItems(newItems)
      setPayload(newPayload as TPayload)
    },
    items,
    itemToString,
    onSelectedItemChange: () => {
      if (!clearOnSelect) return
      setInputValue('')
      setItems([])
    },
    defaultInputValue: itemToString((defaultValue as TItem) ?? null),
  })

  return children({
    getLabelProps,
    getInputProps,
    getMenuProps,
    getToggleButtonProps,
    getItemProps,
    setInputValue,
    inputValue,
    isOpen,
    selectedItem,
    highlightedItem: items[highlightedIndex] ?? null,
    items,
    setItems,
    payload,
  })
}
