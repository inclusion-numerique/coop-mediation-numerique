import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { ClientApi } from '@app/web/features/clients-api/domain'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'
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
