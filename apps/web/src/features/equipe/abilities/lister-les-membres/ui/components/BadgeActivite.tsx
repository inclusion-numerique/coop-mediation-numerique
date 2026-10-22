'use client'

import TooltipIcon from '@app/ui/components/TooltipIcon'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

export const BadgeActivite = ({
  activite,
  libelle,
}: {
  activite: 'actif' | 'inactif'
  libelle: string
}) => {
  const [estMonte, setEstMonte] = useState(false)
  const infobulleId = useId()

  useEffect(() => setEstMonte(true), [])

  return (
    <span
      className={`fr-badge fr-badge--no-icon fr-badge--sm fr-badge--${activite === 'actif' ? 'success' : 'warning'}`}
    >
      {libelle}
      {activite === 'inactif' && (
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
                Un utilisateur est comptabilisé comme inactif à partir de 30
                jours d'inactivité (30 jours sans avoir rempli au moins un CRA).
              </span>,
              document.body,
            )}
        </>
      )}
    </span>
  )
}
