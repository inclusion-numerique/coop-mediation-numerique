import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@/libraries/ui/components/administration/AdministrationInfoCard'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import { HREF_DES_CLIENTS_API } from '../../../../ui/presenters/liens.presenter'
import { CreerUnClientApi } from '../components/CreerUnClientApi'

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
