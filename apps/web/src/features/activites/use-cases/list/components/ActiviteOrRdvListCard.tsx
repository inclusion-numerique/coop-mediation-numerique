import classNames from 'classnames'
import { ReactNode } from 'react'

/**
 * Composant générique pour les listes d'activités d'un médiateur ou d'un bénéficiaire
 */
const ActiviteOrRdvListCard = ({
  actions,
  contentBottom,
  contentTop,
  illustrationSrc,
  enlargeButton,
  enlargeLink,
  stacked,
  firstOfStack,
  lastOfStack,
}: {
  illustrationSrc: string
  contentTop: ReactNode
  contentBottom: ReactNode
  actions?: ReactNode
  enlargeButton?: boolean
  enlargeLink?: boolean
  stacked?: boolean // Cards can be stacked, they will not have any margin between them and borders are collapsed
  firstOfStack?: boolean // The first card of a stack will have top border radius
  lastOfStack?: boolean // The last card of a stack will have bottom border radius
}) => (
  <div
    className={classNames(
      'fr-border fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-flex-grow-1',
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
    <div className="fr-background-alt--blue-france fr-p-2v fr-border-radius--8 fr-flex">
      <img
        className="fr-display-block"
        alt=""
        src={illustrationSrc}
        style={{ width: 40, height: 40 }}
      />
    </div>
    <div className="fr-flex-grow-1">
      <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
        {contentTop}
      </div>
      <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--sm fr-text--medium fr-mb-0">
        {contentBottom}
      </div>
    </div>
    <div className="fr-text--sm fr-text-mention--grey fr-mb-0 fr-flex fr-align-items-center">
      {actions}
    </div>
  </div>
)

export default ActiviteOrRdvListCard
