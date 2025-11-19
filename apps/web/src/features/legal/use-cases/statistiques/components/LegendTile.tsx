import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import classNames from 'classnames'
import React from 'react'

export const LegendTile = ({
  value,
  percent,
  label,
  description,
  legendColor,
  className,
}: {
  value: number
  percent: number
  label: string
  description?: string
  legendColor: string
  className?: string
}) => (
  <div
    className={classNames(
      'fr-p-8v fr-background-default--grey fr-border-radius--8 fr-height-full',
      className,
    )}
  >
    <p className="fr-h4 fr-mb-0 fr-flex fr-align-items-center fr-flex-gap-3v">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill={legendColor}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="7.99951" r="8" />
      </svg>
      <span>
        {numberToString(value)}
        <span className="fr-text-mention--grey fr-text--regular">
          &nbsp;·&nbsp;{numberToPercentage(percent)}
        </span>
      </span>
    </p>
    <p className="fr-mb-0 fr-text-mention--grey">{label}</p>
    {description && (
      <p className="fr-mb-0 fr-text-label--blue-france fr-text--xs">
        {description}
      </p>
    )}
  </div>
)
