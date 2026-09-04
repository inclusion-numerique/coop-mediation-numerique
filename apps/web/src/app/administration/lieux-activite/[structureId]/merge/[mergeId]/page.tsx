import { metadataTitle } from '@app/web/app/metadataTitle'
import { apercuDeLaFusion } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux'
import { ApercuDeLaFusionPage } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux/ui'
import { notFound } from 'next/navigation'

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
    <ApercuDeLaFusionPage structureId={structureId} mergeData={mergeData} />
  )
}

export default Page
