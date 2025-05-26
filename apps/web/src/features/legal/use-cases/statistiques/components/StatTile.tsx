import { numberToString } from '@app/web/utils/formatNumber'
import classNames from 'classnames'
import Image from 'next/image'
import React from 'react'

type ImageStatTileProps = {
  variant: 'image'
  src: string
}

type IconStatTileProps = {
  variant: 'icon'
  iconId: string
}

type StatTileProps = {
  value: number
  percentage?: number
  label: string
  description: string
} & (ImageStatTileProps | IconStatTileProps)

export const StatTile = ({
  value,
  percentage,
  label,
  description,
  ...rest
}: StatTileProps) => (
  <div className="fr-border fr-p-8v fr-border-radius--8 fr-height-full">
    <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-4v">
      {rest.variant === 'icon' && (
        <div>
          <span
            className={classNames(
              rest.iconId,
              'ri-lg fr-text-label--blue-france fr-background-alt--blue-france fr-p-2v fr-border-radius--8',
            )}
            aria-hidden="true"
          ></span>
        </div>
      )}
      {rest.variant === 'image' && (
        <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
          <Image
            className="fr-p-2v fr-background-alt--blue-france fr-border-radius--8"
            width={37}
            height={37}
            src={rest.src}
            alt=""
          />
        </div>
      )}
      <p className="fr-h4 fr-mb-0">
        {numberToString(value)}
        {percentage != null && (
          <span className="fr-text-mention--grey fr-text--regular">
            &nbsp;·&nbsp;{percentage}&nbsp;%
          </span>
        )}
      </p>
    </div>
    <p className="fr-mb-0 fr-text--lg">
      {label}
      <br />
      <span className="fr-text-title--blue-france fr-text--xs fr-mb-0 fr-display-block">
        {description}
      </span>
    </p>
  </div>
)
