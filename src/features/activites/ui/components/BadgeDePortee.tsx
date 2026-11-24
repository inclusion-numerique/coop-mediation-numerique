'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import TooltipIcon from '@/libraries/ui/components/TooltipIcon'
import type {
  EquipeDuTag,
  PorteeDuTag,
} from '../../action/rechercher-des-tags.key'

const APPARENCE: Record<PorteeDuTag, { libelle: string; classe: string }> = {
  Personnel: { libelle: 'Tag personnel', classe: 'fr-text-mention--grey' },
  Equipe: { libelle: 'Tag d’équipe', classe: 'fr-badge--brown-caramel' },
  Departemental: { libelle: 'Tag départemental', classe: 'fr-badge--info' },
  National: { libelle: 'Tag national', classe: 'fr-badge--green-menthe' },
}

export const BadgeDePortee = ({
  portee,
  equipe = null,
  small,
}: {
  portee: PorteeDuTag
  equipe?: EquipeDuTag | null
  small?: boolean
}) => {
  const [estMonte, setEstMonte] = useState(false)
  const infobulleId = useId()

  useEffect(() => setEstMonte(true), [])

  const { libelle, classe } = APPARENCE[portee]
  const equipeAffichee = portee === 'Equipe' ? equipe : null

  return (
    <Badge
      as="span"
      small={small}
      className={classNames('fr-text--nowrap', classe)}
      noIcon
    >
      {libelle}
      {equipeAffichee != null && ` ${equipeAffichee.numero}`}
      {equipeAffichee != null && (
        <>
          <TooltipIcon
            tooltipId={infobulleId}
            className="fr-position-relative fr-index-10"
          />
          {estMonte &&
            createPortal(
              <span
                className="fr-tooltip fr-placement"
                id={infobulleId}
                role="tooltip"
                aria-hidden
              >
                Équipe {equipeAffichee.numero} - Coordonnée par{' '}
                {equipeAffichee.coordonneePar}
              </span>,
              document.body,
            )}
        </>
      )}
    </Badge>
  )
}
