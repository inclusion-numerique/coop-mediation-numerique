import type { PropsWithChildren } from 'react'
import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@/app/coop/CoopPageContainer'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'

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
