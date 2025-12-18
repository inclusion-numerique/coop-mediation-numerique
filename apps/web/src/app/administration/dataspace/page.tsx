import { metadataTitle } from '@app/web/app/metadataTitle'
import { mockDataspaceDatabase } from '@app/web/external-apis/dataspace/dataspaceApiClientMock'
import DataspacePage from '@app/web/features/dataspace/use-cases/administration/DataspacePage'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

export const metadata = {
  title: metadataTitle('Dataspace'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = () => (
  <DataspacePage
    apiIsMocked={ServerWebAppConfig.Dataspace.isMocked}
    mockedApiEmails={Object.keys(mockDataspaceDatabase)}
  />
)

export default Page
