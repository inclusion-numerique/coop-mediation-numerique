import type { PropsWithChildren } from 'react'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'

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
