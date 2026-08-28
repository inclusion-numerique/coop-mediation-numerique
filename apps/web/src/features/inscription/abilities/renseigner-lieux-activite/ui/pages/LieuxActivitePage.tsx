'use client'

import type { LieuActiviteInput } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import LieuxActiviteForm from '@app/web/features/inscription/abilities/renseigner-lieux-activite/ui/components/LieuxActiviteForm'
import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'

const LieuxActivitePage = ({
  lieuxActivite,
}: {
  lieuxActivite: LieuActiviteInput[]
}) => (
  <InscriptionCard
    title="Renseignez vos lieux d'activité"
    backHref="/inscription/lieux-activite/structure-employeuse"
    stepNumber={2}
    totalSteps={3}
    nextStepTitle="Récapitulatif de vos informations"
    subtitle={
      <span className="fr-mb-4v">
        Vos lieux d'activité sont les lieux où vous accueillez et accompagnez
        vos bénéficiaires (ex : lieu de permanence...)
      </span>
    }
  >
    <LieuxActiviteForm
      lieuxExistants={lieuxActivite}
      nextHref="/inscription/recapitulatif"
      retourHref="/inscription/lieux-activite"
    />
  </InscriptionCard>
)

export default LieuxActivitePage
