'use client'

import CreateCraModalContent from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModalContent'
import type { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

export const CreateCraBeneficiaireModalDefinition = createModal({
  id: 'create-cra-beneficiaire',
  isOpenedByDefault: false,
})

const BeneficiaireEnregistrerUneActivite = ({
  beneficiaire,
  displayName,
  label = 'Enregistrer une activité',
  size,
}: {
  beneficiaire: BeneficiaireCraData
  displayName: string
  label?: string
  size?: 'small' | 'medium' | 'large'
}) => (
  <>
    <div className="fr-flex fr-direction-column fr-flex-gap-2v">
      <Button
        iconId="fr-icon-add-line"
        size={size}
        onClick={CreateCraBeneficiaireModalDefinition.open}
      >
        {label}
      </Button>
    </div>
    <CreateCraBeneficiaireModalDefinition.Component
      title={`Ajouter une activité pour ${displayName}`}
    >
      <CreateCraModalContent
        retour={`/coop/mes-beneficiaires/${beneficiaire.id}/accompagnements`}
        craDefaultValues={{ beneficiaire }}
        atelier={false}
        onClose={CreateCraBeneficiaireModalDefinition.close}
      />
    </CreateCraBeneficiaireModalDefinition.Component>
  </>
)

export default BeneficiaireEnregistrerUneActivite
