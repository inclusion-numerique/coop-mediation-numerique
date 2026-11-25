import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { listerLesClientsApi } from '@/features/clients-api/abilities/lister-les-clients-api/implementations/prisma/clients-api.query'
import { ClientsApiPage } from '@/features/clients-api/abilities/lister-les-clients-api/ui/pages/ClientsApiPage'

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
