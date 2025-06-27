import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

export const ReferentStructure = ({
  nomReferent,
  courrielReferent,
  telephoneReferent,
}: {
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
}) => (
  <div className="fr-mt-6v fr-pt-4v fr-px-6v fr-pb-6v fr-background-alt--blue-france fr-border-radius--8">
    <div className="fr-flex fr-align-items-center fr-mb-2v">
      <h2 className="fr-text-title--blue-france fr-text--xs fr-text--uppercase fr-mb-0">
        Contact principal de la structure
      </h2>
      <Button
        className="fr-ml-1v"
        title="Plus d’information à propos du contact principal de la structure"
        priority="tertiary no outline"
        size="small"
        iconId="fr-icon-question-line"
        type="button"
        aria-describedby="tooltip-contact-principal"
      />
      <span
        className="fr-tooltip fr-placement"
        id="tooltip-contact-principal"
        role="tooltip"
        aria-hidden
      >
        Si vous constatez une erreur sur le contact principal de la structure,
        c'est à la structure de venir mettre à jour cette information via le
        tableau de pilotage conseiller numérique, dans la section
        &gt;&nbsp;Gérer ma structure.
      </span>
    </div>
    <div className="fr-flex fr-direction-column fr-flex-gap-1v">
      <span className="fr-text--lg fr-text--bold fr-mb-1v">{nomReferent}</span>
      {(courrielReferent || telephoneReferent) && (
        <span className="fr-text-mention--grey fr-text--sm fr-mb-0 fr-flex fr-flex-gap-2v">
          {courrielReferent && (
            <span>
              <span className="ri-mail-line fr-mr-2v" aria-hidden />
              {courrielReferent}
            </span>
          )}
          {telephoneReferent && courrielReferent && (
            <span className="fr-hidden fr-unhidden-md" aria-hidden>
              ·
            </span>
          )}
          {telephoneReferent && (
            <span>
              <span className="ri-phone-line fr-mr-2v" aria-hidden />
              {telephoneReferent}
            </span>
          )}
        </span>
      )}
    </div>
  </div>
)
