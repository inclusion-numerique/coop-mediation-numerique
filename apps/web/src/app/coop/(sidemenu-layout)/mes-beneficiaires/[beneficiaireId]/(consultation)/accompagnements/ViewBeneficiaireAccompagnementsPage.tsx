import { BeneficiaireAccompagnementsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireAccompagnementsPageData'
import BeneficiairePageNavigationBar from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/BeneficiairePageNavigationBar'
import ActiviteCard from '@app/web/features/activites/use-cases/list/components/ActiviteCard'
import ActiviteDetailsModal from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsModal'
import RdvCard from '@app/web/features/activites/use-cases/list/components/RdvCard'

const ViewBeneficiaireAccompagnementsPage = ({
  data: { activitesAndRdvs, beneficiaire, activites, user },
}: {
  data: BeneficiaireAccompagnementsPageData
}) => (
  <>
    <BeneficiairePageNavigationBar
      beneficiaireId={beneficiaire.id}
      accompagnementsCount={activitesAndRdvs.length}
      current="accompagnements"
    />
    {activitesAndRdvs.length === 0 && (
      <div className="fr-border-radius--8 fr-border  fr-py-8v fr-px-8v fr-mt-6v fr-text--center">
        <p className="fr-text--sm fr-mb-0">
          Aucun accompagnement pour le moment
        </p>
      </div>
    )}
    {activitesAndRdvs.map((activite) =>
      'agents' in activite ? (
        <RdvCard
          key={activite.id}
          activite={activite}
          user={user}
          displayDate
        />
      ) : (
        <ActiviteCard
          key={activite.id}
          activite={activite}
          variant="without-beneficiaire"
          displayDateDay
        />
      ),
    )}
    {activites.length > 0 && <ActiviteDetailsModal />}
  </>
)

export default ViewBeneficiaireAccompagnementsPage
