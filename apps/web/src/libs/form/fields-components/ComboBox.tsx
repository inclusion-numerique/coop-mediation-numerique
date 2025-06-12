import {
  ComboBox as ComboBoxBase,
  type ComboBoxData as ComboBoxBaseData,
  type ComboBoxProps as ComboBoxBaseProps,
} from '@app/web/libs/ui/primitives/form/ComboBox'
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
  const { form, name, state, setValue, setMeta } = useFieldContext<TItem>()

  const isMultipleSelection = getMultipleSelection(state)
  const defaultValue: TItem =
    comboBoxProps.defaultValue ?? form.options.defaultValues[name]

  const appendValue = (value: TItem, values: TItem[]): void => {
    if (values.some(alreadyExist(comboBoxProps)(value))) return
    setValue([...values, value] as TItem)
  }

  return (
    <ComboBoxBase
      {...comboBoxProps}
      clearOnSelect={isMultipleSelection}
      defaultValue={defaultValue}
    >
      {({
        getLabelProps,
        getInputProps,
        getMenuProps,
        getItemProps,
        isOpen,
        selectedItem,
        highlightedItem,
        items,
        setItems,
        payload,
      }) =>
        comboBoxProps.children({
          getLabelProps,
          getMenuProps,
          getInputProps: <TOptions,>(options: TOptions) =>
            getInputProps({
              disabled: comboBoxProps.isPending,
              onFocusCapture: () => {
                if (
                  isMultipleSelection ||
                  comboBoxProps.itemToString(state.value) !== ''
                )
                  return
                setValue(comboBoxProps.defaultValue as TItem)
              },
              onInput: () => {
                if (isMultipleSelection) return
                setValue(comboBoxProps.defaultValue as TItem)
              },
              onBlur: () => {
                setMeta({ ...state.meta, isBlurred: true })
                if (isMultipleSelection) setItems([])
              },
              onKeyDown: (e: KeyboardEvent<HTMLInputElement>): void => {
                if (e.key !== 'Enter' || highlightedItem == null) return
                return isMultipleSelection
                  ? appendValue(highlightedItem, state.value)
                  : setValue(highlightedItem)
              },
              ...options,
            }),
          getItemProps: (options) =>
            getItemProps({
              onClick: () =>
                isMultipleSelection
                  ? appendValue(options.item, state.value)
                  : setValue(options.item),
              ...options,
            }),
          isOpen,
          highlightedItem,
          selectedItem,
          items,
          setItems,
          payload,
        })
      }
    </ComboBoxBase>
  )
}
