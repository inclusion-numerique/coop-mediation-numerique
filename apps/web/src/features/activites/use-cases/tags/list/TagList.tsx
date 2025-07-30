import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { ReactNode } from 'react'
import { TagScope } from '../tagScope'

export const TagList = ({
  tags,
  actions,
}: {
  tags: { id: string; nom: string; scope: TagScope; description?: string }[]
  actions?: (tag: {
    id: string
    nom: string
    scope: TagScope
    description?: string
  }) => ReactNode
}) => (
  <ul className="fr-raw-list">
    {tags.map((tag) => (
      <li
        key={tag.id}
        className="fr-border--bottom fr-py-5v fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v"
      >
        <div>
          <span className="fr-text--bold">{tag.nom}</span>
          {tag.description && (
            <p className="fr-mb-0 fr-text--sm fr-text-mention--grey">
              {tag.description}
            </p>
          )}
        </div>
        <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
          {actions?.(tag)}
          <Badge
            className={classNames(
              'fr-text--nowrap',
              tag.scope === 'personnel' ? 'fr-text-mention--grey' : undefined,
            )}
            severity={tag.scope === 'personnel' ? undefined : 'info'}
            noIcon
          >
            Tag {tag.scope}
          </Badge>
        </div>
      </li>
    ))}
  </ul>
)
