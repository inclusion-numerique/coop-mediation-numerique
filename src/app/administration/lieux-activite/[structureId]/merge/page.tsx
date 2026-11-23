import { notFound } from 'next/navigation'
import { rechercherUnLieuAFusionnerAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementation/session/authenticateUser'
import { lieuAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux'
import { RECHERCHER_UN_LIEU_A_FUSIONNER_ACTION_KEY } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/rechercher-un-lieu-a-fusionner.key'
import { FusionnerUnLieuPage } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  await authenticateAdmin()
  const { structureId } = await props.params
  const pageData = await lieuAFusionner(structureId)
  if (!pageData) return notFound()

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_A_FUSIONNER_ACTION_KEY}
      to={rechercherUnLieuAFusionnerAction}
    >
      <FusionnerUnLieuPage structureId={structureId} nom={pageData.nom} />
    </ClientBinder>
  )
}

export default Page
