import { creerUnClientApiAction } from '@app/web/app/_actions/clients-api/creer-un-client-api.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { CREER_UN_CLIENT_API_ACTION_KEY } from '@app/web/features/clients-api/abilities/creer-un-client-api/action/creer-un-client-api.key'
import { CreerUnClientApiPage } from '@app/web/features/clients-api/abilities/creer-un-client-api/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'

export const metadata = {
  title: metadataTitle('Clients API - Créer'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = () => (
  <ClientBinder
    bind={CREER_UN_CLIENT_API_ACTION_KEY}
    to={creerUnClientApiAction}
  >
    <CreerUnClientApiPage aujourdHui={dateAsIsoDay(new Date())} />
  </ClientBinder>
)

export default Page
