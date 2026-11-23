import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticateUser'
import { listerLesClientsApi } from '@/features/clients-api/abilities/lister-les-clients-api'
import { ClientsApiPage } from '@/features/clients-api/abilities/lister-les-clients-api/ui'

export const metadata = {
  title: metadataTitle('Clients API'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  await authenticateAdmin()
  return <ClientsApiPage clients={await listerLesClientsApi()} />
}

export default Page
