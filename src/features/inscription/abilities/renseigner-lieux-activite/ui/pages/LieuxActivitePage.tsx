'use client'

import type { ReactNode } from 'react'
import InscriptionCard from '@/features/inscription/ui/components/InscriptionCard'

const LieuxActivitePage = ({ formulaire }: { formulaire: ReactNode }) => (
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
    {formulaire}
  </InscriptionCard>
)

export default LieuxActivitePage
