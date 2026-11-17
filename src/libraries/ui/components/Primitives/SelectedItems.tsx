import { TagProps } from '@codegouvfr/react-dsfr/Tag'
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup'

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
  onClick,
  className,
}: SelectedItemsProps<T>) =>
  values.length > 0 && (
    <TagsGroup
      className={className}
      tags={
        values.map((value) =>
          onClick
            ? {
                children: (
                  <>
                    {itemToString(value)} &nbsp;
                    <span className="fr-icon-close-line fr-icon--sm" />
                  </>
                ),
                nativeButtonProps: { onClick: onClick(value), type: 'button' },
              }
            : { children: itemToString(value) },
        ) as [TagProps, ...TagProps[]]
      }
    />
  )
