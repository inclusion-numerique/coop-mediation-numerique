import type { ReactNode } from 'react'
import BeneficiairePageNavigationBar from '../components/BeneficiairePageNavigationBar'

const ViewBeneficiaireAccompagnementsPage = ({
  beneficiaireId,
  nombreDAccompagnements,
  accompagnements,
}: {
  beneficiaireId: string
  nombreDAccompagnements: number
  accompagnements: ReactNode
}) => (
  <>
    <BeneficiairePageNavigationBar
      beneficiaireId={beneficiaireId}
      accompagnementsCount={nombreDAccompagnements}
      current="accompagnements"
    />
    {nombreDAccompagnements === 0 ? (
      <div className="fr-border-radius--8 fr-border  fr-py-8v fr-px-8v fr-mt-6v fr-text--center">
        <p className="fr-text--sm fr-mb-0">
          Aucun accompagnement pour le moment
        </p>
      </div>
    ) : (
      accompagnements
    )}
  </>
)

export default ViewBeneficiaireAccompagnementsPage
