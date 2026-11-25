import classNames from 'classnames'
import { ReactNode } from 'react'
import {
  typeActivitePictograms,
  typeActivitePluralLabels,
} from '@/features/activites/ui/labels/libelles/type-activite.labels'
import { numberToPercentage, numberToString } from '@/libraries/nombre'

export const StatistiqueAccompagnement = ({
  typeActivite,
  count,
  proportion,
  className,
  children,
}: {
  typeActivite: keyof typeof typeActivitePictograms
  count: number
  proportion: number
  className?: string
  children?: ReactNode
}) => {
  const Pictogram = typeActivitePictograms[typeActivite]

  return (
    <div
      className={classNames(
        className,
        'fr-flex fr-align-items-center fr-flex-gap-4v',
      )}
    >
      <div
        className="fr-border-radius--8 fr-background-default--grey"
        aria-hidden
        style={{ height: '56px', width: '56px' }}
      >
        <Pictogram width={56} height={56} />
      </div>
      <div>
        <div className="fr-flex fr-direction-row fr-align-items-baseline fr-text--nowrap">
          <span className="fr-h4 fr-mb-0">{numberToString(count ?? 0)}</span>
          <span className="fr-ml-2v fr-text--sm fr-mb-0 fr-text-mention--grey ">
            {numberToPercentage(proportion)}
          </span>
          {children}
        </div>
        <div className="fr-text--sm fr-mb-0">
          {typeActivitePluralLabels[typeActivite]}
        </div>
      </div>
    </div>
  )
}
