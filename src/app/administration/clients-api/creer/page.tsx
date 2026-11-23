import { creerUnClientApiAction } from '@/app/_actions/clients-api/creer-un-client-api.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementation/session/authenticateUser'
import { CREER_UN_CLIENT_API_ACTION_KEY } from '@/features/clients-api/abilities/creer-un-client-api/action/creer-un-client-api.key'
import { CreerUnClientApiPage } from '@/features/clients-api/abilities/creer-un-client-api/ui'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Clients API - Créer'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  await authenticateAdmin()
  return (
    <ClientBinder
      bind={CREER_UN_CLIENT_API_ACTION_KEY}
      to={creerUnClientApiAction}
    >
      <CreerUnClientApiPage aujourdHui={dateAsIsoDay(new Date())} />
    </ClientBinder>
  )
}

export default Page
