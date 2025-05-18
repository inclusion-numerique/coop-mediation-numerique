import { ReactNode } from 'react'

/**
 * Composant générique pour les listes d'activités d'un médiateur ou d'un bénéficiaire
 */
const ActiviteOrRdvListCard = ({
  actions,
  contentBottom,
  contentTop,
  illustrationSrc,
}: {
  illustrationSrc: string
  contentTop: ReactNode
  contentBottom: ReactNode
  actions?: ReactNode
}) => (
  <div className="fr-border fr-border-radius--8 fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-my-2v fr-enlarge-button fr-border-radius--8">
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
    <div className="fr-text--sm fr-text-mention--grey fr-mb-0">{actions}</div>
  </div>
)

export default ActiviteOrRdvListCard
