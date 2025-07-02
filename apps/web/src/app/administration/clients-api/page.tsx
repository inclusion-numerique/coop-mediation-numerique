import ApiClientsTable from '@app/web/app/administration/clients-api/ApiClientsTable'
import { getApiClientsListPageData } from '@app/web/app/administration/clients-api/getApiClientsListPageData'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'

export const metadata = {
  title: metadataTitle('Clients API'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  const data = await getApiClientsListPageData()

  return (
    <CoopPageContainer size="full">
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Clients API" />
      <main id={contentId}>
        <AdministrationTitle
          icon="ri-key-2-line"
          actions={
            <div className="fr-flex fr-flex-gap-2v">
              <Button
                iconId="fr-icon-file-text-line"
                linkProps={{ href: '/api/v1/documentation', target: '_blank' }}
                className="fr-mr-2v"
                priority="secondary"
              >
                Documentation
              </Button>
              <Button
                iconId="fr-icon-add-line"
                linkProps={{ href: '/administration/clients-api/creer' }}
              >
                Ajouter un client API
              </Button>
            </div>
          }
        >
          Clients API
        </AdministrationTitle>
        <ApiClientsTable
          data={data.apiClients}
          searchParams={{}}
          baseHref="/administration/clients-api"
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
