'use client'

import { useState } from 'react'
import { CoordinationEmptyState } from './CoordinationEmptyState'

type ActiviteType = 'Evenement' | 'Partenariat' | 'Animation'

type ActiviteCount = { type: ActiviteType; count: number }

type ActiviteGrouped = Record<string, ActiviteCount[]>

const getQuarterLabel = (key: string): string => {
  const [year, quarter] = key.split('-q')
  return `${quarter === '1' ? '1er' : `${quarter}e`} trimestre ${year}`
}

export const ActivitesCoordination = ({
  activites,
}: {
  activites: ActiviteGrouped
}) => {
  const [selectedActivitesKey, setSelectedActivitesKey] = useState('all')

  return (
    <>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-3w">
        <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
          <span className="ri-user-community-line fr-mr-1w" aria-hidden />
          Mes activités de coordination
        </h2>
        {activites[selectedActivitesKey].length > 0 && (
          <select
            className="fr-select fr-width-auto"
            defaultValue={selectedActivitesKey}
            aria-label="Sélectionner une période"
            onChange={({ target: { value } }) => {
              setSelectedActivitesKey(value)
            }}
          >
            {Object.keys(activites).map((key) =>
              key === 'all' ? null : (
                <option key={key} value={key}>
                  {getQuarterLabel(key)}
                </option>
              ),
            )}
            <option value="all">En cumulé</option>
          </select>
        )}
      </div>
      {activites[selectedActivitesKey].length > 0 ? (
        <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
          {activites[selectedActivitesKey].map(({ type, count }) => (
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
}
