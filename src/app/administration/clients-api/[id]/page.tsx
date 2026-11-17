import { modifierUnClientApiAction } from '@app/web/app/_actions/clients-api/modifier-un-client-api.action'
import { renouvelerLeSecretAction } from '@app/web/app/_actions/clients-api/renouveler-le-secret.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { consulterUnClientApi } from '@app/web/features/clients-api/abilities/consulter-un-client-api'
import { ClientApiPage } from '@app/web/features/clients-api/abilities/consulter-un-client-api/ui'
import { MODIFIER_UN_CLIENT_API_ACTION_KEY } from '@app/web/features/clients-api/abilities/modifier-un-client-api/action/modifier-un-client-api.key'
import { ModifierUnClientApi } from '@app/web/features/clients-api/abilities/modifier-un-client-api/ui'
import { RENOUVELER_LE_SECRET_ACTION_KEY } from '@app/web/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.key'
import { RenouvelerLeSecret } from '@app/web/features/clients-api/abilities/renouveler-le-secret/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Client API - Détails'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const consultation = await consulterUnClientApi((await params).id)

  if (!consultation.success) return notFound()

  const client = consultation.data

  return (
    <ClientBinder
      bind={RENOUVELER_LE_SECRET_ACTION_KEY}
      to={renouvelerLeSecretAction}
    >
      <ClientBinder
        bind={MODIFIER_UN_CLIENT_API_ACTION_KEY}
        to={modifierUnClientApiAction}
      >
        <ClientApiPage
          client={client}
          secret={<RenouvelerLeSecret clientApiId={client.id} />}
          modification={<ModifierUnClientApi client={client} />}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
