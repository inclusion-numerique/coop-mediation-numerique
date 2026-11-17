import type { PropsWithChildren } from 'react'
import CoopPageContainer from '@/app/coop/CoopPageContainer'
import { metadataTitle } from '@/app/metadataTitle'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libs/ui/administration/AdministrationTitle'
import { contentId } from '@/utils/skipLinks'

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
