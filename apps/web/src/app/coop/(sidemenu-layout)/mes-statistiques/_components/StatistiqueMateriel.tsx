import { materielIcons } from '@app/web/features/activites/use-cases/cra/fields/materiel'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { Materiel } from '@prisma/client'
import classNames from 'classnames'

export const StatistiqueMateriel = ({
  label,
  value,
  count,
  proportion,
  className,
}: {
  label: string
  value: Materiel
  count: number
  proportion: number
  className?: string
}) => (
  <div className={classNames('fr-text--center', className)}>
    <div
      className="fr-background-alt--blue-france fr-p-2w fr-mb-3v fr-border-radius--8 fr-display-inline-block"
      aria-hidden
    >
      <div
        style={
          materielIcons[value].rotation
            ? { transform: `rotate(${materielIcons[value].rotation}deg)` }
            : {}
        }
        className={`${materielIcons[value].icon} ri-lg fr-line-height-1 fr-text-label--blue-france`}
      />
    </div>
    <div className="fr-flex fr-flex-gap-2v fr-justify-content-center">
      <span className="fr-text--bold">{numberToString(count)}</span>
      <span className="fr-text-mention--grey">
        {numberToPercentage(proportion)}
      </span>
    </div>
    {label}
  </div>
)
