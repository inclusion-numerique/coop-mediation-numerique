import {
  ComboBox as ComboBoxBase,
  type ComboBoxData as ComboBoxBaseData,
  type ComboBoxProps as ComboBoxBaseProps,
} from '@app/ui/components/Primitives/Form/ComboBox'
import { isEqual } from 'lodash-es'
import { KeyboardEvent } from 'react'
import { useFieldContext } from '../form-context'

export type ComboBoxData<TItem, TPayload = {}> = ComboBoxBaseData<
  TItem,
  TPayload
> & {
  itemToKey: (item: TItem) => string
}

export type ComboBoxProps<TItem, TPayload extends object> = ComboBoxBaseProps<
  TItem,
  TPayload
> & {
  isPending: boolean
  itemToKey: (item: TItem) => string
  resetValue?: Partial<TItem> | TItem[] | null
  onSelect?: (item: TItem) => void
}

const getMultipleSelection = <TItem,>(state: {
  value: TItem | TItem[]
}): state is { value: TItem[] } => Array.isArray(state.value)

const alreadyExist =
  <TItem,>({ itemToKey }: { itemToKey: (value: TItem) => string }) =>
  (newValue: TItem) =>
  (value: TItem): boolean =>
    isEqual(itemToKey(value), itemToKey(newValue))

export const ComboBox = <TItem, TPayload extends object>(
  comboBoxProps: ComboBoxProps<TItem, TPayload>,
) => {
  const { state, setValue, setMeta } = useFieldContext<TItem>()

  const isMultipleSelection = getMultipleSelection(state)

  const appendValue = (value: TItem, values: TItem[]): void => {
    if (values.some(alreadyExist(comboBoxProps)(value))) return
    setValue([...values, value] as TItem)
  }

  const notSelectedIn = (selectedItems: TItem[]) => (defaultItem: TItem) =>
    !selectedItems
      .map(comboBoxProps.itemToKey)
      .includes(comboBoxProps.itemToKey(defaultItem))

  const currentValueKey = state.value
    ? comboBoxProps.itemToKey(state.value)
    : 'empty'

  return (
    <ComboBoxBase
      key={currentValueKey}
      {...comboBoxProps}
      clearOnSelect={isMultipleSelection}
      defaultValue={state.value}
    >
      {({
        getLabelProps,
        getInputProps,
        getMenuProps,
        getToggleButtonProps,
        getItemProps,
        isOpen,
        setInputValue,
        inputValue,
        selectedItem,
        highlightedItem,
        items,
        setItems,
        payload,
      }) =>
        comboBoxProps.children({
          getLabelProps,
          getToggleButtonProps,
          getMenuProps,
          getInputProps: <TOptions,>(options: TOptions) => {
            const resetItemsToDefault = () => {
              if (isMultipleSelection) {
                setItems(
                  comboBoxProps.defaultItems?.filter(
                    notSelectedIn(state.value),
                  ) ?? [],
                )
                return
              }
              if (comboBoxProps.itemToString(state.value) !== '') {
                setItems(comboBoxProps.defaultItems ?? [])
                return
              }
              setValue((comboBoxProps.resetValue ?? null) as TItem)
            }

            return getInputProps({
              disabled: comboBoxProps.isPending,
              onFocusCapture: resetItemsToDefault,
              onClick: resetItemsToDefault,
              onInput: () => {
                if (isMultipleSelection) return
                setValue((comboBoxProps.resetValue ?? null) as TItem)
              },
              onBlur: () => {
                setMeta({ ...state.meta, isBlurred: true })
                if (isMultipleSelection) setItems([])
              },
              onKeyDown: (e: KeyboardEvent<HTMLInputElement>): void => {
                if (e.key !== 'Enter' || highlightedItem == null) return
                isMultipleSelection
                  ? appendValue(highlightedItem, state.value)
                  : setValue(highlightedItem)
                comboBoxProps.onSelect?.(highlightedItem)
              },
              ...options,
            })
          },
          getItemProps: (options) =>
            getItemProps({
              onClick: () => {
                isMultipleSelection
                  ? appendValue(options.item, state.value)
                  : setValue(options.item)
                comboBoxProps.onSelect?.(options.item)
              },
              ...options,
            }),
          isOpen,
          setInputValue,
          inputValue,
          highlightedItem,
          selectedItem: state.value ?? selectedItem,
          items,
          setItems,
          payload,
        })
      }
    </ComboBoxBase>
  )
}
