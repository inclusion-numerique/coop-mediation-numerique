import { metadataTitle } from '@app/web/app/metadataTitle'
import { MergeLieuInclusionPreviewPage } from '@app/web/features/structures/use-cases/merge/pages/MergeLieuInclusionPreviewPage'
import { getMergeLieuInclusionPreviewPageData } from '@app/web/features/structures/use-cases/merge/queries/getMergeLieuInclusionPreviewPageData'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureId: string; mergeId: string }>
}) => {
  const { structureId, mergeId } = await props.params
  const mergeData = await getMergeLieuInclusionPreviewPageData(
    mergeId,
    structureId,
  )
  if (!mergeData) return notFound()

  return (
    <MergeLieuInclusionPreviewPage
      structureId={structureId}
      mergeData={mergeData}
    />
  )
}

export default Page
