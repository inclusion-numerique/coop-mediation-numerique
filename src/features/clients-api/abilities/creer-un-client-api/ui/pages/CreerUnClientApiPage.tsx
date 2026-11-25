import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationInfoCard,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
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
