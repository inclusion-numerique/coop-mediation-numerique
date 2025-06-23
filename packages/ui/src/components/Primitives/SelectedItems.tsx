import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import { ReactNode } from 'react'

export type SelectedItemsData<T> = {
  itemToKey: (value: T) => string
  itemToString: (value: T) => string
}

export type SelectedItemsProps<T> = {
  values: T[]
  itemToKey: (value: T) => string
  itemToString: (value: T) => string
  onClick?: (value: T) => () => void
  className?: string
}

export const SelectedItems = <T,>({
  values,
  itemToString,
  itemToKey,
  onClick,
  className,
}: SelectedItemsProps<T>) =>
  values.length > 0 && (
    <ul className={classNames('fr-raw-list', className)}>
      {values.map(
        (value: T): ReactNode => (
          <li key={itemToKey(value)}>
            {onClick != null ? (
              <Tag
                nativeButtonProps={{
                  onClick: onClick(value),
                }}
              >
                {itemToString(value)}
                &nbsp;
                <span className="fr-icon-close-line fr-icon--sm" />
              </Tag>
            ) : (
              <Tag>{itemToString(value)}</Tag>
            )}
          </li>
        ),
      )}
    </ul>
  )
