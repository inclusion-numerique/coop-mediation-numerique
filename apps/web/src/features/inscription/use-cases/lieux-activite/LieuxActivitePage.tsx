'use client'

import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'
import LieuxActiviteForm from '@app/web/features/inscription/use-cases/lieux-activite/LieuxActiviteForm'
import { StructureData } from '@app/web/features/structures/StructureValidation'

const LieuxActivitePage = ({
  userId,
  lieuxActivite,
}: {
  userId: string
  lieuxActivite: StructureData[]
}) => (
  <InscriptionCard
    title="Renseignez vos lieux d'activité"
    backHref="/inscription/lieux-activite/structure-employeuse"
    stepNumber={2}
    totalSteps={3}
    nextStepTitle="Récapitulatif de vos informations"
    subtitle={
      <>
        <span className="fr-mb-4v">
          Vos lieux d'activité sont les lieux où vous accueillez et accompagnez
          vos bénéficiaires (ex : lieu de permanence...)
        </span>
        <span
          className="fr-display-block fr-mt-4v fr-mb-12v fr-px-6v fr-py-4v fr-width-full fr-border-radius--8"
          style={{ backgroundColor: 'var(--background-contrast-info)' }}
        >
          <span className="fr-display-block fr-text--bold fr-mb-1v">
            Renseignez au moins un lieu d’activité pour finaliser votre
            inscription.
          </span>
          <span className="fr-text--sm fr-mb-2v">
            Vous pourrez également les renseigner plus tard via votre espace.
          </span>
        </span>
      </>
    }
  >
    <LieuxActiviteForm
      defaultValues={{
        userId,
        lieuxActivite,
        addLieuActiviteCartographieNationaleId: '',
      }}
      nextHref="/inscription/recapitulatif"
      createStructureBackHref="/inscription/lieux-activite"
    />
  </InscriptionCard>
)

export default LieuxActivitePage
