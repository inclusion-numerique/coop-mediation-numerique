import { useFieldContext } from '@app/web/libs/form/form-context'
import { ReactNode, useEffect } from 'react'

export type SyncWithProps<TItem> = {
  children: ReactNode
  target?: TItem
  itemToKey: (item: TItem) => string
  onUpdate: (item: TItem) => void
}

export const SyncWith = <TItem,>({
  target,
  itemToKey,
  onUpdate,
  children,
}: SyncWithProps<TItem>) => {
  const { state } = useFieldContext<TItem>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: onUpdate and itemToKey are not in dependencies as it should not retrigger the call
  useEffect(() => {
    if (
      target == null ||
      state.value == null ||
      itemToKey(state.value) !== itemToKey(target)
    )
      return
    onUpdate(target)
  }, [target, state])

  return children
}
