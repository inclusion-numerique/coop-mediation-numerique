import { notFound } from 'next/navigation'
import { rechercherUnLieuAFusionnerAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { RECHERCHER_UN_LIEU_A_FUSIONNER_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/action/rechercher-un-lieu-a-fusionner.key'
import { lieuAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/implementations/prisma/lieu-a-fusionner.query'
import { FusionnerUnLieuPage } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/ui/pages/FusionnerUnLieuPage'
import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/ui/slots/ChoisirLeLieuAFusionner.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

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
      <FusionnerUnLieuPage
        structureId={structureId}
        nom={pageData.nom}
        choixDuLieu={<ChoisirLeLieuAFusionner structureId={structureId} />}
      />
    </ClientBinder>
  )
}

export default Page
