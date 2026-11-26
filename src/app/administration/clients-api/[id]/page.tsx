import { notFound } from 'next/navigation'
import { modifierUnClientApiAction } from '@/app/_actions/clients-api/modifier-un-client-api.action'
import { renouvelerLeSecretAction } from '@/app/_actions/clients-api/renouveler-le-secret.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterUnClientApi } from '@/features/clients-api/abilities/consulter-un-client-api/domain/consulter-un-client-api'
import { lireLeClientApi } from '@/features/clients-api/abilities/consulter-un-client-api/implementations/prisma/client-api.query'
import { ClientApiPage } from '@/features/clients-api/abilities/consulter-un-client-api/ui/pages/ClientApiPage'
import { MODIFIER_UN_CLIENT_API_ACTION_KEY } from '@/features/clients-api/abilities/modifier-un-client-api/action/modifier-un-client-api.key'
import { ModifierUnClientApi } from '@/features/clients-api/abilities/modifier-un-client-api/ui/slots/ModifierUnClientApi.slot'
import { RENOUVELER_LE_SECRET_ACTION_KEY } from '@/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.key'
import { RenouvelerLeSecret } from '@/features/clients-api/abilities/renouveler-le-secret/ui/slots/RenouvelerLeSecret.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata = {
  title: metadataTitle('Client API - Détails'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin()
  const consultation = await consulterUnClientApi({ lireLeClientApi })({
    clientApiId: (await params).id,
  })

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
