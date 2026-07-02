import { metadataTitle } from '@app/web/app/metadataTitle'
import { MergeLieuInclusionPage } from '@app/web/features/structures/use-cases/merge/pages/MergeLieuInclusionPage'
import { getMergeLieuInclusionPageData } from '@app/web/features/structures/use-cases/merge/queries/getMergeLieuInclusionPageData'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  const { structureId } = await props.params
  const pageData = await getMergeLieuInclusionPageData(structureId)
  if (!pageData) return notFound()

  return <MergeLieuInclusionPage structureId={structureId} nom={pageData.nom} />
}

export default Page
