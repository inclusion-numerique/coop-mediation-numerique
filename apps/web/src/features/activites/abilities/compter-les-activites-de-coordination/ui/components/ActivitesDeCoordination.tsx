'use client'

import { useState } from 'react'
import { CoordinationEmptyState } from '../../../../ui/CoordinationEmptyState'
import type { ActivitesDeCoordinationPresentees } from '../activites-de-coordination.presenter'

export const ActivitesDeCoordination = ({
  activites: { aucuneActivite, periodes, periodeParDefaut },
}: {
  activites: ActivitesDeCoordinationPresentees
}) => {
  const [cle, setCle] = useState(periodeParDefaut)
  const periode = periodes.find((candidate) => candidate.cle === cle)

  return (
    <>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-3w">
        <h2 className="fr-h6 fr-text-mention--grey fr-mb-0">
          <span
            className="ri-user-community-line ri-lg fr-text--regular fr-mr-2v"
            aria-hidden
          />
          Mes activités de coordination
        </h2>
        {!aucuneActivite && (
          <select
            className="fr-select fr-width-auto"
            value={cle}
            aria-label="Sélectionner une période"
            onChange={({ target: { value } }) => setCle(value)}
          >
            {periodes.map(({ cle: valeur, libelle }) => (
              <option key={valeur} value={valeur}>
                {libelle}
              </option>
            ))}
          </select>
        )}
      </div>
      {aucuneActivite || periode === undefined ? (
        <CoordinationEmptyState />
      ) : (
        <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
          {periode.compteurs.map(({ libelle, nombre }) => (
            <div
              key={libelle}
              className="fr-flex fr-flex-1 fr-direction-column fr-background-alt--blue-france fr-px-6v fr-py-4v fr-border-radius--16"
            >
              <span className="fr-text--uppercase fr-text--xs fr-text--bold fr-mb-0 fr-text-default--grey">
                {libelle}
              </span>
              <span className="fr-text--lg fr-text--bold fr-mb-0">
                {nombre}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
