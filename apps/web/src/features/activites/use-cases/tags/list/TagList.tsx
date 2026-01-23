import { numberToString } from '@app/web/utils/formatNumber'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { ReactNode } from 'react'
import TagScopeBadge from '../components/TagScopeBadge'
import { TagScope } from '../tagScope'

const accompagnementsTooltip = (count: number) => {
  if (count === 0) return 'Aucun accompagnement n’est lié à ce tag'
  if (count === 1) return '1 accompagnement est lié à ce tag'
  return `${numberToString(count)} accompagnements sont liés à ce tag`
}

export const TagList = ({
  tags,
  actions,
}: {
  tags: {
    id: string
    nom: string
    scope: TagScope
    description?: string
    usageCount?: number
    accompagnementsCount: number
    equipeId?: string
    equipeNumber?: number
    equipeCoordinateurNom?: string
  }[]
  actions?: (tag: {
    id: string
    nom: string
    scope: TagScope
    description?: string
    equipeId?: string
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
        <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
          <Button
            className="fr-px-1v fr-ml-1v fr-no-print"
            title="Plus d’information à propos des accompagnements liés"
            priority="tertiary no outline"
            size="small"
            type="button"
            aria-describedby={`tooltip-accompagnements-${tag.id}`}
          >
            <Badge>
              <span className="ri-service-line fr-mr-1w" aria-hidden />
              {numberToString(tag.accompagnementsCount)}
            </Badge>
          </Button>
          <span
            className="fr-tooltip fr-placement"
            id={`tooltip-accompagnements-${tag.id}`}
            role="tooltip"
            aria-hidden
          >
            {accompagnementsTooltip(tag.accompagnementsCount)}
          </span>

          {tag.usageCount !== undefined && (
            <span className="fr-text--sm fr-text-mention--grey fr-mb-0">
              {numberToString(tag.usageCount)}
            </span>
          )}
          <TagScopeBadge {...tag} />
          {actions?.(tag)}
        </div>
      </li>
    ))}
  </ul>
)
