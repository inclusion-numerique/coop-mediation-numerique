import { type UseComboboxReturnValue, useCombobox } from 'downshift'
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'

export type ComboBoxData<TItem, TPayload = {}> = {
  itemToString: (item: TItem | null) => string
  loadSuggestions: (
    inputValue: string,
  ) => Promise<{ items: TItem[] } & TPayload>
}

export type ComboBoxProps<TItem, TPayload extends object> = {
  defaultItems?: TItem[]
  defaultValue?: Partial<TItem>
  clearOnSelect?: boolean
  beforeLoadSuggestions?: (inputValue: string) => Partial<TPayload>
  loadSuggestionsOnOpenChange?: boolean
  onSelectedItemChange?: (
    item: TItem | null,
    setInputValue: (inputValue: string) => void,
  ) => void
  children: (props: {
    getLabelProps: UseComboboxReturnValue<TItem>['getLabelProps']
    getMenuProps: UseComboboxReturnValue<TItem>['getMenuProps']
    getToggleButtonProps: UseComboboxReturnValue<TItem>['getToggleButtonProps']
    getInputProps: UseComboboxReturnValue<TItem>['getInputProps']
    getItemProps: UseComboboxReturnValue<TItem>['getItemProps']
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
  loadSuggestionsOnOpenChange = false,
  itemToString,
  clearOnSelect = false,
  onSelectedItemChange,
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
    onSelectedItemChange: ({ selectedItem }) => {
      onSelectedItemChange?.(selectedItem, setInputValue)
      if (!clearOnSelect) return
      setInputValue('')
      setItems([])
    },
    defaultInputValue: itemToString((defaultValue as TItem) ?? null),
    onIsOpenChange: async ({ isOpen }) => {
      if (!isOpen || !loadSuggestionsOnOpenChange) return

      const { items: newItems, ...newPayload } =
        await loadSuggestions(inputValue)

      setItems(newItems)
      setPayload(newPayload as TPayload)
    },
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
