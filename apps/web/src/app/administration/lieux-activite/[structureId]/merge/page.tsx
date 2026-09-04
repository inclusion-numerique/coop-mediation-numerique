import { metadataTitle } from '@app/web/app/metadataTitle'
import { lieuAFusionner } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux'
import { FusionnerUnLieuPage } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux/ui'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  const { structureId } = await props.params
  const pageData = await lieuAFusionner(structureId)
  if (!pageData) return notFound()

  return <FusionnerUnLieuPage structureId={structureId} nom={pageData.nom} />
}

export default Page
