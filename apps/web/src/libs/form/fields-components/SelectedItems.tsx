import {
  SelectedItems as SelectedItemsBase,
  SelectedItemsProps as SelectedItemsBaseProps,
} from '@app/ui/components/Primitives/SelectedItems'
import { ReactNode } from 'react'
import { useFieldContext } from '../form-context'

export type SelectedItemProps<T> = Omit<SelectedItemsBaseProps<T>, 'values'>

export const SelectedItems = <T,>({
  ...props
}: SelectedItemProps<T>): ReactNode => {
  const { state, setValue } = useFieldContext<T[]>()

  return (
    <SelectedItemsBase<T>
      values={state.value}
      onClick={(valueToRemove: T) => (): void => {
        setValue(
          state.value.filter((value: T): boolean => value !== valueToRemove),
        )
      }}
      {...props}
    />
  )
}
