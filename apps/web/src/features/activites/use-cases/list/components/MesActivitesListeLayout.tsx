import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { PropsWithChildren } from 'react'
import ActiviteDetailsModal from './ActiviteDetailsModal/ActiviteDetailsModal'
import MesActivitesVueSegmentedControl from './MesActivitesVueSegmentedControl'

const MesActivitesListeLayout = ({
  children,
  vue,
  empty,
}: PropsWithChildren<{ vue: 'liste' | 'tableau'; empty?: boolean }>) => (
  <CoopPageContainer size={794}>
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Mes activités" />
    <main id={contentId}>
      <div className="fr-mb-4v fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center">
        <h1 className="fr-text-title--blue-france fr-mb-0">Mes activités</h1>
        {!empty && <MesActivitesVueSegmentedControl current={vue} />}
      </div>
      {children}
    </main>
    <ActiviteDetailsModal />
  </CoopPageContainer>
)

export default MesActivitesListeLayout
