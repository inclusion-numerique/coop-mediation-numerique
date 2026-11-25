import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  Card,
  CoopPageContainer,
} from '@/libraries/ui/components'

export const OutilsAdministrateurPage = ({
  maintenance,
  exportDesAccompagnements,
  relances,
}: {
  maintenance: ReactNode
  exportDesAccompagnements: ReactNode
  relances: ReactNode
}) => (
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
            <Card title="Mode maintenance">{maintenance}</Card>
          </div>
          <div className="fr-col-12">
            <Card title="Export des accompagnements">
              {exportDesAccompagnements}
            </Card>
          </div>
          <div className="fr-col-12">
            <Card title="Lancer une action planifiée">
              <div className="fr-flex fr-direction-column fr-flex-gap-6v">
                {relances}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  </CoopPageContainer>
)
