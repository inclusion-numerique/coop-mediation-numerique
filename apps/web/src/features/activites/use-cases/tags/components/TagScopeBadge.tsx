'use client'

import TooltipIcon from '@app/ui/components/TooltipIcon'
import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { TagScope } from '../tagScope'

const TAG_SEVERITY: Record<TagScope, string> = {
  [TagScope.Personnel]: 'fr-text-mention--grey',
  [TagScope.Equipe]: 'fr-badge--brown-caramel',
  [TagScope.Departemental]: 'fr-badge--info',
  [TagScope.National]: 'fr-badge--green-menthe',
}

const TagScopeBadge = ({
  scope,
  small,
  className,
  equipeNumber,
  equipeCoordinateurNom,
}: {
  scope: TagScope
  small?: boolean
  className?: string
  equipeNumber?: number
  equipeCoordinateurNom?: string
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const uniqueId = useId()

  useEffect(() => setIsMounted(true), [])

  const showEquipeTooltip =
    scope === TagScope.Equipe &&
    equipeNumber != null &&
    equipeCoordinateurNom != null

  return (
    <Badge
      small={small}
      className={classNames('fr-text--nowrap', TAG_SEVERITY[scope], className)}
      noIcon
    >
      Tag {scope}
      {scope === TagScope.Equipe && equipeNumber != null && ` ${equipeNumber}`}
      {showEquipeTooltip && (
        <>
          <TooltipIcon
            tooltipId={uniqueId}
            className="fr-position-relative fr-index-10"
          />
          {isMounted &&
            createPortal(
              <span
                className="fr-tooltip fr-placement"
                id={uniqueId}
                role="tooltip"
                aria-hidden
              >
                Équipe {equipeNumber} - Coordonnée par {equipeCoordinateurNom}
              </span>,
              document.body,
            )}
        </>
      )}
    </Badge>
  )
}

export default TagScopeBadge
