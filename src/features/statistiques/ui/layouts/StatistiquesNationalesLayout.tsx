import type { ReactNode } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'

export const StatistiquesNationalesLayout = ({
  children,
}: {
  children: ReactNode
}) => (
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
