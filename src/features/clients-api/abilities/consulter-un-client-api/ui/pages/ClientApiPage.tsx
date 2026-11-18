import type { ReactNode } from 'react'
import type { ClientApi } from '@/features/clients-api/domain'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@/libraries/ui/components/administration/AdministrationInfoCard'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
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
