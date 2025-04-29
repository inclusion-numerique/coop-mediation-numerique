'use client'

import CreateCraModalContent from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModalContent'
import type { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'

export const CreateCraBeneficiaireModalDefinition = createModal({
  id: 'create-cra-beneficiaire',
  isOpenedByDefault: false,
})

const BeneficiaireAjouterUneActivite = ({
  beneficiaire,
  displayName,
}: {
  beneficiaire: BeneficiaireCraData
  displayName: string
}) => (
  <>
    <div className="fr-flex fr-direction-column fr-flex-gap-2v">
      <Button
        iconId="fr-icon-add-line"
        onClick={CreateCraBeneficiaireModalDefinition.open}
      >
        Ajouter une activité
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

export default BeneficiaireAjouterUneActivite
