import { metadataTitle } from '@app/web/app/metadataTitle'
import { listerLesClientsApi } from '@app/web/features/clients-api/abilities/lister-les-clients-api'
import { ClientsApiPage } from '@app/web/features/clients-api/abilities/lister-les-clients-api/ui'

export const metadata = {
  title: metadataTitle('Clients API'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => (
  <ClientsApiPage clients={await listerLesClientsApi()} />
)

export default Page
