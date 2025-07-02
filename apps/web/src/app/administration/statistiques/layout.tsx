import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import type { PropsWithChildren } from 'react'

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdministrationStatistiquesLayout = ({ children }: PropsWithChildren) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Statistiques" />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-line-chart-line">
        Statistiques
      </AdministrationTitle>
      {children}
    </main>
  </CoopPageContainer>
)

export default AdministrationStatistiquesLayout
