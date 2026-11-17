import { notFound } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { apercuDeLaFusion } from '@/features/lieux-activite/abilities/fusionner-des-lieux'
import { ApercuDeLaFusionPage } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui'

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
