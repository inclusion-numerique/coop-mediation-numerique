import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'

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
