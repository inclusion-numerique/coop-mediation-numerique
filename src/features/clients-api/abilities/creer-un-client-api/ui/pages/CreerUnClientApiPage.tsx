import CoopPageContainer from '@/app/coop/CoopPageContainer'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@/libraries/ui/components/administration/AdministrationInfoCard'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
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
