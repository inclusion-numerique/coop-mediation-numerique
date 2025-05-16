import BeneficiairePageNavigationBar from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/BeneficiairePageNavigationBar'
import ActiviteBeneficiaireCard from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/ActiviteBeneficiaireCard'
import ActiviteRdvBeneficiaireCard from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/ActiviteRdvBeneficiaireCard'
import { BeneficiaireAccompagnementsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireAccompagnementsPageData'
import ActiviteDetailsModal from '@app/web/features/activites/use-cases/list/components/ActiviteDetailsModal/ActiviteDetailsModal'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import { Fragment } from 'react'

const ViewBeneficiaireAccompagnementsPage = ({
  data: { activitesByDate, beneficiaire, rdvs },
}: {
  data: BeneficiaireAccompagnementsPageData
}) => (
  <>
    <BeneficiairePageNavigationBar
      beneficiaireId={beneficiaire.id}
      accompagnementsCount={beneficiaire._count.accompagnements + rdvs.length}
      current="accompagnements"
    />
    {activitesByDate.length === 0 && (
      <div className="fr-border-radius--8 fr-border  fr-py-8v fr-px-8v fr-mt-6v fr-text--center">
        <p className="fr-text--sm fr-mb-0">
          Aucun accompagnement pour le moment
        </p>
      </div>
    )}
    {activitesByDate.map(({ date, activites }) => (
      <Fragment key={new Date(date).toISOString()}>
        <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-my-4v">
          {formatActiviteDayDate(date)}
        </h3>
        {activites.map((activite) =>
          'agents' in activite ? (
            <ActiviteRdvBeneficiaireCard
              key={activite.id}
              activite={activite}
            />
          ) : (
            <ActiviteBeneficiaireCard key={activite.id} activite={activite} />
          ),
        )}
      </Fragment>
    ))}
    {activitesByDate.length > 0 && <ActiviteDetailsModal />}
  </>
)

export default ViewBeneficiaireAccompagnementsPage
