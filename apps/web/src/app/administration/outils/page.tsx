import { reglerLaMaintenanceAction } from '@app/web/app/_actions/maintenance-mode/regler-la-maintenance.action'
import { relancerLesInscriptionsInacheveesAction } from '@app/web/app/_actions/utilisateurs/relancer-les-inscriptions-inachevees.action'
import { relancerLesInscritsInactifsAction } from '@app/web/app/_actions/utilisateurs/relancer-les-inscrits-inactifs.action'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import Card from '@app/web/components/Card'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { ExportDesAccompagnementsParDepartement } from '@app/web/features/activites/abilities/exporter-les-accompagnements-par-departement/ui'
import NormaliserBeneficiaires from '@app/web/features/beneficiaire/abilities/normaliser-beneficiaires/ui/NormaliserBeneficiaires'
import {
  consulterLaMaintenance,
  consulterLHistoriqueDesMaintenances,
} from '@app/web/features/maintenance-mode/abilities/consulter-la-maintenance'
import { REGLER_LA_MAINTENANCE_ACTION_KEY } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance/action/regler-la-maintenance.key'
import { ReglageDeLaMaintenance } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance/ui'
import { RELANCER_LES_INSCRIPTIONS_INACHEVEES_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/action/relancer-les-inscriptions-inachevees.key'
import { LancerLesRelancesDInscription } from '@app/web/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/ui'
import { RELANCER_LES_INSCRITS_INACTIFS_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/action/relancer-les-inscrits-inactifs.key'
import { LancerLesRelancesDesInscrits } from '@app/web/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

export const metadata = {
  title: metadataTitle('Outils administrateur'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  const [maintenance, historique] = await Promise.all([
    consulterLaMaintenance(),
    consulterLHistoriqueDesMaintenances(),
  ])

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Outils" />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-settings-5-line">
          Outils administrateur
        </AdministrationTitle>
        <div className="fr-container fr-my-8w">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12">
              <Card title="Mode maintenance">
                <ClientBinder
                  bind={REGLER_LA_MAINTENANCE_ACTION_KEY}
                  to={reglerLaMaintenanceAction}
                >
                  <ReglageDeLaMaintenance
                    etat={maintenance}
                    historique={historique}
                  />
                </ClientBinder>
              </Card>
            </div>
            <div className="fr-col-12">
              <Card title="Export des accompagnements">
                <ExportDesAccompagnementsParDepartement />
              </Card>
            </div>
            <div className="fr-col-12">
              <Card title="Lancer une action planifiée">
                <div className="fr-flex fr-direction-column fr-flex-gap-6v">
                  <ClientBinder
                    bind={RELANCER_LES_INSCRIPTIONS_INACHEVEES_ACTION_KEY}
                    to={relancerLesInscriptionsInacheveesAction}
                  >
                    <LancerLesRelancesDInscription />
                  </ClientBinder>
                  <ClientBinder
                    bind={RELANCER_LES_INSCRITS_INACTIFS_ACTION_KEY}
                    to={relancerLesInscritsInactifsAction}
                  >
                    <LancerLesRelancesDesInscrits />
                  </ClientBinder>
                </div>
              </Card>
            </div>
            <div className="fr-col-12">
              <Card title="Maintenance des données bénéficiaires">
                <NormaliserBeneficiaires />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </CoopPageContainer>
  )
}

export default Page
