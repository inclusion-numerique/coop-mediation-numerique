import {
  typeActiviteIllustrations,
  typeActivitePluralLabels,
} from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { TypeActivite } from '@prisma/client'
import classNames from 'classnames'
import { ReactNode } from 'react'

export const StatistiqueAccompagnement = ({
  typeActivite,
  count,
  proportion,
  className,
  children,
}: {
  typeActivite: TypeActivite
  count: number
  proportion: number
  className?: string
  children?: ReactNode
}) => (
  <div
    className={classNames(
      className,
      'fr-flex fr-align-items-center fr-flex-gap-4v',
    )}
  >
    <div className="fr-py-1v fr-px-2v fr-border-radius--8 fr-background-default--grey">
      <img src={typeActiviteIllustrations[typeActivite]} />
    </div>
    <div>
      <div className="fr-flex fr-direction-row fr-align-items-baseline">
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
