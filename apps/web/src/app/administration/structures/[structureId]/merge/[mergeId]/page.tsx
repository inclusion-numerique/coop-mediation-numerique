import { metadataTitle } from '@app/web/app/metadataTitle'
import { MergeStructurePreviewPage } from '@app/web/features/structures/use-cases/merge/pages/MergeStructurePreviewPage'
import { getMergeStructurePreviewPageData } from '@app/web/features/structures/use-cases/merge/queries/getMergeStructurePreviewPageData'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureId: string; mergeId: string }>
}) => {
  const { structureId, mergeId } = await props.params
  const mergeData = await getMergeStructurePreviewPageData(mergeId, structureId)
  if (!mergeData) return notFound()

  return (
    <MergeStructurePreviewPage
      structureId={structureId}
      mergeData={mergeData}
    />
  )
}

export default Page
