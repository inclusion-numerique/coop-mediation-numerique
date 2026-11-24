import Button from '@codegouvfr/react-dsfr/Button'
import type { ClientApi } from '@/features/clients-api/domain'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import { BoutonDocumentation } from '../../../../ui/components/BoutonDocumentation'
import { HREF_DES_CLIENTS_API } from '../../../../ui/presenters/liens.presenter'
import { ListeDesClientsApi } from '../components/ListeDesClientsApi'

export const ClientsApiPage = ({
  clients,
}: {
  clients: readonly ClientApi[]
}) => (
  <CoopPageContainer size="full">
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Clients API" />
    <main id={contentId}>
      <AdministrationTitle
        icon="ri-key-2-line"
        actions={
          <div className="fr-flex fr-flex-gap-2v">
            <BoutonDocumentation />
            <Button
              iconId="fr-icon-add-line"
              linkProps={{ href: `${HREF_DES_CLIENTS_API}/creer` }}
            >
              Ajouter un client API
            </Button>
          </div>
        }
      >
        Clients API
      </AdministrationTitle>
      <ListeDesClientsApi clients={clients} />
    </main>
  </CoopPageContainer>
)
