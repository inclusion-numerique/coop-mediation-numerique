import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { ClientApi } from '@app/web/features/clients-api/domain'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@app/web/libs/ui/administration/AdministrationInfoCard'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import { BoutonDocumentation } from '../../../../ui/BoutonDocumentation'
import { HREF_DES_CLIENTS_API } from '../../../../ui/liens'

export const ClientApiPage = ({
  client,
  secret,
  modification,
}: {
  client: ClientApi
  secret: ReactNode
  modification: ReactNode
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage={client.nom}
      parents={[
        { label: 'Clients API', linkProps: { href: HREF_DES_CLIENTS_API } },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle
        icon="ri-key-2-line"
        actions={<BoutonDocumentation />}
      >
        {client.nom}
      </AdministrationTitle>
      <AdministrationInfoCard>
        <h2 className="fr-h4">Générer un token secret unique</h2>
        {secret}
      </AdministrationInfoCard>
      <AdministrationInfoCard>
        <h2 className="fr-h4">Modifier le client API</h2>
        {modification}
      </AdministrationInfoCard>
    </main>
  </CoopPageContainer>
)
