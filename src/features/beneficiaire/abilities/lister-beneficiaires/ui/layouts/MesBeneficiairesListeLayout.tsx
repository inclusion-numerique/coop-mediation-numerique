import type { PropsWithChildren } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { CoopBreadcrumbs, CoopPageContainer } from '@/libraries/ui/components'

const MesBeneficiairesListeLayout = ({ children }: PropsWithChildren) => (
  <CoopPageContainer size={56}>
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Mes bénéficiaires" />
    <main
      id={contentId}
      className="fr-mt-4v fr-mb-5v fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center"
    >
      <h1 className="fr-text-title--blue-france fr-mb-0">Mes bénéficiaires</h1>
    </main>
    {children}
  </CoopPageContainer>
)

export default MesBeneficiairesListeLayout
