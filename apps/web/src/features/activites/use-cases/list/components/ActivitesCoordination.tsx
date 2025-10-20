import React from 'react'
import { CoordinationEmptyState } from './CoordinationEmptyState'

export const ActivitesCoordination = ({
  activites,
}: {
  activites: {
    type: 'Animation' | 'Evenement' | 'Partenariat'
    count: number
  }[]
}) => (
  <>
    <h2 className="fr-h5 fr-text-mention--grey fr-mb-3w">
      <span className="ri-service-line fr-mr-1w" aria-hidden />
      Mes activités de coordination
    </h2>

    {activites.length > 0 ? (
      <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
        {activites.map(({ type, count }) => (
          <div
            key={type}
            className="fr-flex fr-flex-1 fr-direction-column fr-background-alt--blue-france fr-p-6v fr-border-radius--8"
          >
            <span className="fr-text--uppercase fr-text--xs fr-text--bold fr-mb-0 fr-text-default--grey">
              {type === 'Evenement' ? 'Évènement' : type}
            </span>
            <span className="fr-text--lg fr-text--bold fr-mb-0">{count}</span>
          </div>
        ))}
      </div>
    ) : (
      <CoordinationEmptyState />
    )}
  </>
)
