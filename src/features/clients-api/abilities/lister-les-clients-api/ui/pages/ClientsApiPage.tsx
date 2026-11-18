import Button from '@codegouvfr/react-dsfr/Button'
import CoopPageContainer from '@/app/coop/CoopPageContainer'
import type { ClientApi } from '@/features/clients-api/domain'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import { BoutonDocumentation } from '../../../../ui/BoutonDocumentation'
import { HREF_DES_CLIENTS_API } from '../../../../ui/liens'
import { ListeDesClientsApi } from '../ListeDesClientsApi'

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
