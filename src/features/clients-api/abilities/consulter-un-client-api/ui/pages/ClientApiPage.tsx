import type { ReactNode } from 'react'
import CoopPageContainer from '@/app/coop/CoopPageContainer'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import type { ClientApi } from '@/features/clients-api/domain'
import AdministrationBreadcrumbs from '@/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@/libs/ui/administration/AdministrationInfoCard'
import AdministrationTitle from '@/libs/ui/administration/AdministrationTitle'
import { contentId } from '@/utils/skipLinks'
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
