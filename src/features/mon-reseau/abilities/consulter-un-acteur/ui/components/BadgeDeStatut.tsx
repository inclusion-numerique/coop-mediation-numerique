'use client'

import TooltipIcon from '@app/ui/components/TooltipIcon'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { SEUIL_D_INACTIVITE_EN_JOURS } from '../../domain'
import type { StatutAffiche } from '../fiche-acteur.presenter'

export const BadgeDeStatut = ({
  statut: { libelle, severite, infobulle },
}: {
  statut: StatutAffiche
}) => {
  const [monte, monter] = useState(false)
  const id = useId()

  useEffect(() => monter(true), [])

  return (
    <span
      className={`fr-badge fr-badge--no-icon fr-badge--${severite} fr-badge--sm`}
    >
      {libelle}
      {infobulle && (
        <>
          <TooltipIcon
            tooltipId={id}
            className="fr-position-relative fr-index-10"
          />
          {monte &&
            createPortal(
              <span
                className="fr-tooltip fr-placement"
                id={id}
                role="tooltip"
                aria-hidden
              >
                Un utilisateur est comptabilisé comme inactif à partir de{' '}
                {SEUIL_D_INACTIVITE_EN_JOURS} jours d'inactivité (
                {SEUIL_D_INACTIVITE_EN_JOURS} jours sans avoir rempli au moins
                un CRA).
              </span>,
              document.body,
            )}
        </>
      )}
    </span>
  )
}
