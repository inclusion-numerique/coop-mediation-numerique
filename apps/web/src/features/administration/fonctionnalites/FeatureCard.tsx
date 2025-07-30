import IconInSquare from '@app/web/components/IconInSquare'
import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import React from 'react'

export const FeatureCard = ({
  icon,
  title,
  href,
}: {
  icon: ButtonProps.IconOnly['iconId']
  title: string
  href: string
}) => (
  <div className="fr-border-radius--16 fr-border fr-py-10v fr-px-8v fr-height-full fr-flex fr-direction-column fr-enlarge-link">
    <div
      className={classNames(
        'fr-flex fr-align-items-center fr-align-items-xl-start fr-flex-gap-6v fr-height-full fr-direction-xl-column',
      )}
    >
      <div className="fr-flex fr-justify-content-space-between align-items-center fr-width-full">
        <IconInSquare iconId={icon} size="medium" />
      </div>
      <div className=" fr-flex-grow-1">
        <h3 className="fr-h6 fr-mb-2w">{title}</h3>
        <a
          className="fr-flex-basis-0"
          title={`En savoir plus à propos de ${title}`}
          href={href}
          aria-label={`En savoir plus à propos de ${title}`}
        />
      </div>
      <div className="fr-flex fr-justify-content-end fr-width-full" aria-hidden>
        <span className="fr-icon-arrow-right-line fr-text-title--blue-france" />
      </div>
    </div>
  </div>
)
