import classNames from 'classnames'
import { ReactNode, RefObject, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
  anchorRef,
  className,
}: {
  items: T[]
  isOpen?: boolean
  showEmpty?: boolean
  selectedItem: T | null
  highlightedItem: T | null
  getMenuProps?: () => object
  getItemProps?: ({ item, index }: { item: T; index: number }) => object
  children?: ReactNode
  anchorRef?: RefObject<HTMLElement | null>
  className?: string
} & OptionsData<T>) => {
  const [position, setPosition] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  useEffect(() => {
    if (!anchorRef?.current || !isOpen) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (rect) {
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [anchorRef, isOpen])

  const isHighlighted = (item: T) =>
    highlightedItem != null && itemToKey(item) === itemToKey(highlightedItem)

  const isSelected = (item: T) =>
    selectedItem != null && itemToKey(item) === itemToKey(selectedItem)

  const menuContent = (
    <div
      className={classNames(
        'fr-menu-options',
        className,
        !(isOpen && (items.length > 0 || showEmpty)) && 'hidden',
      )}
      style={
        anchorRef && position
          ? {
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
            }
          : undefined
      }
    >
      <ul className="fr-menu-options__list" {...getMenuProps?.()}>
        {isOpen &&
          items.map(
            (item: T, index: number): ReactNode => (
              <li
                {...getItemProps?.({ item, index })}
                key={itemToKey(item)}
                className={classNames(
                  'fr-menu-options__item',
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
        {isOpen && items.length === 0 && children && (
          <li className="fr-menu-options__item">{children}</li>
        )}
      </ul>
    </div>
  )

  return anchorRef && isMounted
    ? createPortal(menuContent, document.body)
    : menuContent
}
