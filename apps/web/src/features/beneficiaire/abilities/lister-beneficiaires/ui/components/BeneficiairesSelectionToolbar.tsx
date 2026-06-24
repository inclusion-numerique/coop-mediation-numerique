'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import Button from '@codegouvfr/react-dsfr/Button'
import { DeleteBulkBeneficiairesModal } from './DeleteBulkBeneficiairesModal'

export const BeneficiairesSelectionToolbar = ({
  totalItems,
  selectedCount,
}: {
  totalItems: number
  selectedCount: number
}) => (
  <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-5v">
    <p className="fr-mb-0 fr-py-2v">
      <span className="fr-text--bold fr-text--lg">
        {totalItems} bénéficiaire{sPluriel(totalItems)}
      </span>
      {selectedCount > 0 && (
        <span className="fr-text-mention--grey fr-text--sm fr-text--semi-bold">
          {' · '}
          {selectedCount} bénéficiaire{sPluriel(selectedCount)} sélectionné
          {sPluriel(selectedCount)}
        </span>
      )}
    </p>
    {selectedCount > 0 && (
      <Button
        priority="tertiary"
        iconId="fr-icon-delete-line"
        iconPosition="right"
        onClick={() => DeleteBulkBeneficiairesModal.open()}
      >
        Supprimer
      </Button>
    )}
  </div>
)
