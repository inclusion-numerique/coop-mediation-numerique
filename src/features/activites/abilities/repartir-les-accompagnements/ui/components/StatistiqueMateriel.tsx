import classNames from 'classnames'
import { materielIcons } from '@/features/activites/ui/labels/libelles/materiel.labels'
import {
  numberToPercentage,
  numberToString,
} from '@/libraries/nombre/format-number'

export const StatistiqueMateriel = ({
  label,
  value,
  count,
  proportion,
  className,
}: {
  label: string
  value: keyof typeof materielIcons
  count: number
  proportion: number
  className?: string
}) => (
  <div className={classNames('fr-text--center fr-text--sm fr-mb-0', className)}>
    <div
      className="fr-background-alt--blue-france fr-p-3v fr-mb-3v fr-border-radius--8 fr-display-inline-block"
      aria-hidden
    >
      <div
        style={
          materielIcons[value].rotation
            ? { transform: `rotate(${materielIcons[value].rotation}deg)` }
            : {}
        }
        className={`${materielIcons[value].icon} fr-icon--lg fr-line-height-1 fr-text-label--blue-france`}
      />
    </div>
    <div className="fr-flex fr-flex-gap-2v fr-justify-content-center fr-text--nowrap">
      <span className="fr-text--bold">{numberToString(count)}</span>
      <span className="fr-text-mention--grey">
        {numberToPercentage(proportion)}
      </span>
    </div>
    {label}
  </div>
)
