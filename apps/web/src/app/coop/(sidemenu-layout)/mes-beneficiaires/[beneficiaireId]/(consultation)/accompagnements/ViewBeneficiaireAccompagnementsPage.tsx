import { BeneficiaireAccompagnementsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireAccompagnementsPageData'
import BeneficiairePageNavigationBar from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/BeneficiairePageNavigationBar'
import ActiviteCard from '@app/web/features/activites/use-cases/list/components/ActiviteCard'
import ActiviteDetailsModal from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsModal'
import RdvCard from '@app/web/features/activites/use-cases/list/components/RdvCard'
import RdvStatusUpdateModal from '@app/web/features/activites/use-cases/list/components/RdvStatusUpdateModal/RdvStatusUpdateModal'

const ViewBeneficiaireAccompagnementsPage = ({
  data: { searchResult, beneficiaire, user },
}: {
  data: BeneficiaireAccompagnementsPageData
}) => (
  <>
    <BeneficiairePageNavigationBar
      beneficiaireId={beneficiaire.id}
      accompagnementsCount={searchResult.matchesCount}
      current="accompagnements"
    />
    {searchResult.matchesCount === 0 && (
      <div className="fr-border-radius--8 fr-border  fr-py-8v fr-px-8v fr-mt-6v fr-text--center">
        <p className="fr-text--sm fr-mb-0">
          Aucun accompagnement pour le moment
        </p>
      </div>
    )}
    {searchResult.items.map((item) =>
      item.kind === 'rdv' ? (
        <RdvCard key={item.id} rdv={item} user={user} displayBeneficiaire />
      ) : (
        <ActiviteCard
          key={item.id}
          activite={{ ...item, timezone: user.timezone }}
          variant="with-beneficiaire"
        />
      ),
    )}
    {searchResult.items.length > 0 && (
      <>
        <ActiviteDetailsModal />
        <RdvStatusUpdateModal />
      </>
    )}
  </>
)

export default ViewBeneficiaireAccompagnementsPage
