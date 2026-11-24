'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import TooltipIcon from '@/libraries/ui/components/TooltipIcon'

export const BadgeAvecInfobulle = ({
  libelle,
  classe,
  infobulle,
  small,
}: {
  libelle: string
  classe: string
  infobulle: string | null
  small?: boolean | undefined
}) => {
  const [estMonte, setEstMonte] = useState(false)
  const infobulleId = useId()

  useEffect(() => setEstMonte(true), [])

  return (
    <Badge
      as="span"
      {...(small === undefined ? {} : { small })}
      className={classNames('fr-text--nowrap', classe)}
      noIcon
    >
      {libelle}
      {infobulle !== null && (
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
                {infobulle}
              </span>,
              document.body,
            )}
        </>
      )}
    </Badge>
  )
}
