import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'
import { numberToString } from '@/libraries/nombre/format-number'
import { BadgeAvecInfobulle } from '@/libraries/ui/components/BadgeAvecInfobulle'
import { infobulleDesAccompagnements } from '../presenters/accompagnements.presenter'
import type { TagAffiche } from '../presenters/tag-affiche.presenter'

export const LigneDuTag = ({
  tag,
  accompagnements,
  utilisations,
  small,
  actions,
}: {
  tag: TagAffiche
  accompagnements: number
  utilisations?: number
  small?: boolean
  actions?: ReactNode
}) => (
  <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v">
    <div>
      <span className="fr-text--bold">{tag.nom}</span>
      {tag.description != null && (
        <p className="fr-mb-0 fr-text--sm fr-text-mention--grey">
          {tag.description}
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
        aria-describedby={`tooltip-accompagnements-${tag.id}`}
      >
        <Badge>
          <span className="ri-service-line fr-mr-1w" aria-hidden />
          {numberToString(accompagnements)}
        </Badge>
      </Button>
      <span
        className="fr-tooltip fr-placement"
        id={`tooltip-accompagnements-${tag.id}`}
        role="tooltip"
        aria-hidden
      >
        {infobulleDesAccompagnements(accompagnements)}
      </span>
      {utilisations !== undefined && (
        <span className="fr-text--sm fr-text-mention--grey fr-mb-0">
          {numberToString(utilisations)}
        </span>
      )}
      <BadgeAvecInfobulle {...tag.badge} small={small} />
      {actions}
    </div>
  </div>
)
