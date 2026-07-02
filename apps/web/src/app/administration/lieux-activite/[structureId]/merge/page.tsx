import { metadataTitle } from '@app/web/app/metadataTitle'
import { MergeStructurePage } from '@app/web/features/structures/use-cases/merge/pages/MergeStructurePage'
import { getMergeStructurePageData } from '@app/web/features/structures/use-cases/merge/queries/getMergeStructurePageData'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  const { structureId } = await props.params
  const pageData = await getMergeStructurePageData(structureId)
  if (!pageData) return notFound()

  return <MergeStructurePage structureId={structureId} nom={pageData.nom} />
}

export default Page
