import { notFound } from 'next/navigation'
import { fusionnerDesLieuxAction } from '@/app/_actions/lieux-activite/fusionner-des-lieux.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { apercuDeLaFusion } from '@/features/lieux-activite/abilities/fusionner-des-lieux'
import { FUSIONNER_DES_LIEUX_ACTION_KEY } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.key'
import { ApercuDeLaFusionPage } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureId: string; mergeId: string }>
}) => {
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
