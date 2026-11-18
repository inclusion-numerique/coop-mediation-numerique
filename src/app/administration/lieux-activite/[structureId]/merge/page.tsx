import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { lieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux'
import { FusionnerUnLieuPage } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui'

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
