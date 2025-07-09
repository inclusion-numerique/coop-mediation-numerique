import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import Card from '@app/web/components/Card'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import SyncProfiles from '@app/web/features/conum/use-cases/sync-profiles/SyncProfiles'
import UpdateInfo from '@app/web/features/conum/use-cases/update-info/UpdateInfo'
import UpdateStructureReferent from '@app/web/features/conum/use-cases/update-structure-referent/UpdateStructureReferent'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import DatePickerDownload from './DatePickerDownload'

export const metadata = {
  title: metadataTitle('Outils administrateur'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = () => {
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
              <Card title="Export des accompagnements">
                <DatePickerDownload />
              </Card>
            </div>
            <div className="fr-col-12">
              <Card title="Lancer une action planifiée">
                <div className="fr-flex fr-direction-column fr-flex-gap-6v">
                  <UpdateStructureReferent />
                  <UpdateInfo />
                  <SyncProfiles />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </CoopPageContainer>
  )
}

export default Page
