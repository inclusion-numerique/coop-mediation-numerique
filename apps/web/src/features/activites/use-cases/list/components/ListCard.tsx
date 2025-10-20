import { Pictogram } from '@app/web/features/pictograms/pictogram'
import classNames from 'classnames'
import { ReactNode } from 'react'

const ListCard = ({
  actions,
  contentBottom,
  contentTop,
  pictogram: Pictogram,
  enlargeButton,
  enlargeLink,
  stacked,
  firstOfStack,
  lastOfStack,
  footer,
}: {
  pictogram: Pictogram
  contentTop: ReactNode
  contentBottom: ReactNode
  actions?: ReactNode
  enlargeButton?: boolean
  enlargeLink?: boolean
  stacked?: boolean // Cards can be stacked, they will not have any margin between them and borders are collapsed
  firstOfStack?: boolean // The first card of a stack will have top border radius
  lastOfStack?: boolean // The last card of a stack will have bottom border radius
  footer?: ReactNode
}) => (
  <div
    className={classNames(
      'fr-border fr-p-4v fr-grid-row fr-flex-gap-2v fr-align-items-center',
      {
        'fr-enlarge-button': enlargeButton,
        'fr-enlarge-link': enlargeLink,
        'fr-mt-4v': !stacked || firstOfStack,
        'fr-mt-minus-1px': stacked && !firstOfStack,
        'fr-border-radius--8': !stacked,
        'fr-border-radius-top--8': stacked && firstOfStack,
        'fr-border-radius-bottom--8': stacked && lastOfStack,
      },
    )}
  >
    <div className="fr-flex fr-col fr-flex-gap-4v fr-align-items-center">
      <div
        className="fr-background-alt--blue-france fr-p-1v fr-border-radius--8 fr-flex"
        aria-hidden
      >
        <Pictogram width={36} height={36} />
      </div>
      <div className="fr-flex-grow-1">
        <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
          {contentTop}
        </div>
        <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--sm fr-text--medium fr-mb-0">
          {contentBottom}
        </div>
        {!!footer && footer}
      </div>
    </div>
    <div className="fr-text--sm fr-text-mention--grey fr-mb-0 fr-col-12 fr-col-lg-3 fr-flex fr-justify-content-end fr-align-items-center">
      {actions}
    </div>
  </div>
)

export default ListCard
