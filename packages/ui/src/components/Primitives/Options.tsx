import classNames from 'classnames'
import { ReactNode } from 'react'

export type OptionsData<T> = {
  itemToKey: (item: T) => string
  renderItem: ({
    item,
    index,
    isSelected,
    isHighlighted,
  }: {
    item: T
    index: number
    isSelected: boolean
    isHighlighted: boolean
  }) => ReactNode
}

export const Options = <T,>({
  items,
  isOpen = false,
  showEmpty = false,
  selectedItem,
  highlightedItem,
  getMenuProps,
  getItemProps,
  itemToKey,
  renderItem,
  children,
}: {
  items: T[]
  isOpen?: boolean
  showEmpty?: boolean
  selectedItem: T | null
  highlightedItem: T | null
  getMenuProps?: () => object
  getItemProps?: ({ item, index }: { item: T; index: number }) => object
  children?: ReactNode
} & OptionsData<T>) => {
  const isHighlighted = (item: T) =>
    highlightedItem != null && itemToKey(item) === itemToKey(highlightedItem)

  const isSelected = (item: T) =>
    selectedItem != null && itemToKey(item) === itemToKey(selectedItem)

  return (
    <div
      className={classNames(
        'fr-menu-options',
        !(isOpen && (items.length > 0 || showEmpty)) && 'hidden',
      )}
    >
      <ul className="fr-menu-options__list" {...getMenuProps?.()}>
        {isOpen &&
          items.map(
            (item: T, index: number): ReactNode => (
              <li
                {...getItemProps?.({ item, index })}
                key={itemToKey(item)}
                className={classNames(
                  'fr-menu-options__item ',
                  isHighlighted(item) && 'fr-background-alt--grey',
                  isSelected(item) && 'fr-text-label--blue-france',
                )}
              >
                {renderItem({
                  item,
                  index,
                  isHighlighted: isHighlighted(item),
                  isSelected: isSelected(item),
                })}
              </li>
            ),
          )}
      </ul>
      {children}
    </div>
  )
}
