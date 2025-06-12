'use client'

import type { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

const BeneficiaireEnregistrerUneActivite = ({
  beneficiaire,
  label = 'Enregistrer une activité',
  size,
}: {
  beneficiaire: BeneficiaireCraData
  displayName: string
  label?: string
  size?: 'small' | 'medium' | 'large'
}) => {
  const craDefaultValues = {
    beneficiaire,
  }
  const retour = `/coop/mes-beneficiaires/${beneficiaire.id}/accompagnements`

  const createCraPath = `/coop/mes-activites/cra/individuel?v=${encodeSerializableState(craDefaultValues)}${
    retour ? `&retour=${retour}` : ''
  }`

  return (
    <div className="fr-flex fr-direction-column fr-flex-gap-2v">
      <Button
        iconId="fr-icon-add-line"
        size={size}
        linkProps={{
          href: createCraPath,
        }}
      >
        {label}
      </Button>
    </div>
  )
}

export default BeneficiaireEnregistrerUneActivite
