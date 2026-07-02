import { metadataTitle } from '@app/web/app/metadataTitle'
import { MergeStructureAdministrativePreviewPage } from '@app/web/features/structures/use-cases/merge/pages/MergeStructureAdministrativePreviewPage'
import { getMergeStructureAdministrativePreviewPageData } from '@app/web/features/structures/use-cases/merge/queries/getMergeStructureAdministrativePreviewPageData'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures employeuses - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureAdministrativeId: string; mergeId: string }>
}) => {
  const { structureAdministrativeId, mergeId } = await props.params
  // Convention alignée sur le lieu : mergeId (recherché) = SOURCE supprimée,
  // structureAdministrativeId (page d'origine) = CIBLE conservée.
  const mergeData = await getMergeStructureAdministrativePreviewPageData(
    mergeId,
    structureAdministrativeId,
  )
  if (!mergeData) return notFound()

  return (
    <MergeStructureAdministrativePreviewPage
      structureAdministrativeId={structureAdministrativeId}
      mergeData={mergeData}
    />
  )
}

export default Page
