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
}: {
  illustrationSrc: string
  contentTop: ReactNode
  contentBottom: ReactNode
  actions?: ReactNode
  enlargeButton?: boolean
  enlargeLink?: boolean
}) => (
  <div
    className={classNames(
      'fr-border fr-border-radius--8 fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-mt-4v fr-border-radius--8',
      {
        'fr-enlarge-button': enlargeButton,
        'fr-enlarge-link': enlargeLink,
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
