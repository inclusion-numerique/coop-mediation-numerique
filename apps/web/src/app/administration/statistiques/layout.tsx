import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { PropsWithChildren } from 'react'

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdministrationStatistiquesLayout = ({ children }: PropsWithChildren) => (
  <CoopPageContainer>
    <AdministrationBreadcrumbs currentPage="Statistiques" />
    <AdministrationTitle icon="fr-icon-line-chart-line">
      Statistiques
    </AdministrationTitle>
    {children}
  </CoopPageContainer>
)

export default AdministrationStatistiquesLayout
