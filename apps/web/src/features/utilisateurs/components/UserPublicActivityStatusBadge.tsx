'use client'

import TooltipIcon from '@app/ui/components/TooltipIcon'
import type { UserPublicActivityStatus } from '@app/web/features/utilisateurs/utils/getUserPublicActivityStatus'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

const UserPublicActivityStatusBadge = ({
  status: { status, label },
  size = 'sm',
}: {
  status: UserPublicActivityStatus
  size?: 'sm' | 'md' | 'lg'
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const uniqueId = useId()
  const badgeVariant = status === 'actif' ? 'success' : 'warning'

  useEffect(() => setIsMounted(true), [])

  return (
    <span
      className={`fr-badge fr-badge--no-icon fr-badge--${badgeVariant} fr-badge--${size}`}
    >
      {label}
      {status === 'inactif' && (
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
                Un utilisateur est comptabilisé comme inactif à partir de 30
                jours d'inactivité (30 jours sans avoir rempli au moins un CRA).
                <br />À noter&nbsp;: À partir de 6 mois d'inactivité, son compte
                sera supprimé.
              </span>,
              document.body,
            )}
        </>
      )}
    </span>
  )
}

export default UserPublicActivityStatusBadge
