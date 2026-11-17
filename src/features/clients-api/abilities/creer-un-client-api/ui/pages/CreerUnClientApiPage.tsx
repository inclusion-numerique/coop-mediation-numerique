import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@app/web/libs/ui/administration/AdministrationInfoCard'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import { HREF_DES_CLIENTS_API } from '../../../../ui/liens'
import { CreerUnClientApi } from '../CreerUnClientApi'

export const CreerUnClientApiPage = ({
  aujourdHui,
}: {
  aujourdHui: string
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage="Créer un client API"
      parents={[
        { label: 'Clients API', linkProps: { href: HREF_DES_CLIENTS_API } },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="ri-key-2-line">
        Créer un client API
      </AdministrationTitle>
      <AdministrationInfoCard>
        <CreerUnClientApi aujourdHui={aujourdHui} />
      </AdministrationInfoCard>
    </main>
  </CoopPageContainer>
)
