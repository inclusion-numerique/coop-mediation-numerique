'use client'

import TooltipIcon from '@app/ui/components/TooltipIcon'
import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TypeDePortee } from '../domain'
import type { EquipeAffichee } from './tag-affiche'

const APPARENCE: Record<TypeDePortee, { libelle: string; classe: string }> = {
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
  portee: TypeDePortee
  equipe?: EquipeAffichee | null
  small?: boolean
}) => {
  const [estMonte, setEstMonte] = useState(false)
  const infobulleId = useId()

  useEffect(() => setEstMonte(true), [])

  return (
    <Badge
      as="span"
      small={small}
      className={classNames('fr-text--nowrap', APPARENCE[portee].classe)}
      noIcon
    >
      {APPARENCE[portee].libelle}
      {equipe != null && (
        <>
          {` ${equipe.numero}`}
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
                Équipe {equipe.numero} - Coordonnée par {equipe.coordonneePar}
              </span>,
              document.body,
            )}
        </>
      )}
    </Badge>
  )
}
