import { numberToString } from '@app/web/utils/formatNumber'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { ReactNode } from 'react'
import { TagScope } from '../tagScope'
import TagScopeBadge from './TagScopeBadge'

const accompagnementsTooltip = (count: number) => {
  if (count === 0) return 'Aucun accompagnement n’est lié à ce tag'
  if (count === 1) return '1 accompagnement est lié à ce tag'
  return `${numberToString(count)} accompagnements sont liés à ce tag`
}

export type TagItemProps = {
  id: string
  nom: string
  scope: TagScope
  description?: string
  accompagnementsCount: number
  usageCount?: number
  equipeNumber?: number
  equipeCoordinateurNom?: string
  small?: boolean
  actions?: ReactNode
}

export const TagItem = ({
  id,
  nom,
  scope,
  description,
  accompagnementsCount,
  usageCount,
  equipeNumber,
  equipeCoordinateurNom,
  small,
  actions,
}: TagItemProps) => (
  <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v">
    <div>
      <span className="fr-text--bold">{nom}</span>
      {description && (
        <p className="fr-mb-0 fr-text--sm fr-text-mention--grey">
          {description}
        </p>
      )}
    </div>
    <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
      <Button
        className="fr-px-1v fr-ml-1v fr-no-print"
        title="Plus d'information à propos des accompagnements liés"
        priority="tertiary no outline"
        size="small"
        type="button"
        aria-describedby={`tooltip-accompagnements-${id}`}
      >
        <Badge>
          <span className="ri-service-line fr-mr-1w" aria-hidden />
          {numberToString(accompagnementsCount)}
        </Badge>
      </Button>
      <span
        className="fr-tooltip fr-placement"
        id={`tooltip-accompagnements-${id}`}
        role="tooltip"
        aria-hidden
      >
        {accompagnementsTooltip(accompagnementsCount)}
      </span>
      {usageCount !== undefined && (
        <span className="fr-text--sm fr-text-mention--grey fr-mb-0">
          {numberToString(usageCount)}
        </span>
      )}
      <TagScopeBadge
        scope={scope}
        equipeNumber={equipeNumber}
        equipeCoordinateurNom={equipeCoordinateurNom}
        small={small}
      />
      {actions}
    </div>
  </div>
)
