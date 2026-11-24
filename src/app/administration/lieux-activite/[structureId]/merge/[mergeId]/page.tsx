import { notFound } from 'next/navigation'
import { fusionnerDesLieuxAction } from '@/app/_actions/lieux-activite/fusionner-des-lieux.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { FUSIONNER_DES_LIEUX_ACTION_KEY } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.key'
import { apercuDeLaFusion } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/apercu-de-la-fusion.query'
import { ApercuDeLaFusionPage } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/pages/ApercuDeLaFusionPage'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureId: string; mergeId: string }>
}) => {
  await authenticateAdmin()
  const { structureId, mergeId } = await props.params
  const mergeData = await apercuDeLaFusion(mergeId, structureId)
  if (!mergeData) return notFound()

  return (
    <ClientBinder
      bind={FUSIONNER_DES_LIEUX_ACTION_KEY}
      to={fusionnerDesLieuxAction}
    >
      <ApercuDeLaFusionPage structureId={structureId} mergeData={mergeData} />
    </ClientBinder>
  )
}

export default Page
