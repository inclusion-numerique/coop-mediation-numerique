import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'
import type { PropsWithChildren } from 'react'

const MesBeneficiairesListeLayout = ({ children }: PropsWithChildren) => (
  <CoopPageContainer size={49}>
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Mes bénéficiaires" />
    <main
      id={contentId}
      className="fr-mt-4v fr-mb-5v fr-width-full fr-flex fr-justify-content-space-between fr-align-items-center"
    >
      <h1 className="fr-text-title--blue-france fr-mb-0">Mes bénéficiaires</h1>
      <Button
        iconId="fr-icon-user-add-line"
        linkProps={{
          href: '/coop/mes-beneficiaires/nouveau',
        }}
      >
        Créer un bénéficiaire
      </Button>
    </main>
    {children}
  </CoopPageContainer>
)

export default MesBeneficiairesListeLayout
