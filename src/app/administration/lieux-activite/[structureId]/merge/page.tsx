import { notFound } from 'next/navigation'
import { rechercherUnLieuAFusionnerAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { RECHERCHER_UN_LIEU_A_FUSIONNER_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/action/rechercher-un-lieu-a-fusionner.key'
import { lieuAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/implementations/prisma/lieu-a-fusionner.query'
import { FusionnerUnLieuPage } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/ui/pages/FusionnerUnLieuPage'
import { nomDuLieuAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/ui/presenters/lieu-a-fusionner.presenter'
import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/ui/slots/ChoisirLeLieuAFusionner.slot'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  await authenticateAdmin()
  const { structureId } = await props.params
  const lieuId = LieuId.safe(structureId)
  if (lieuId === null) return notFound()

  const lieu = await lieuAFusionner(lieuId)
  if (lieu === null) return notFound()

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_A_FUSIONNER_ACTION_KEY}
      to={rechercherUnLieuAFusionnerAction}
    >
      <FusionnerUnLieuPage
        structureId={structureId}
        nom={nomDuLieuAFusionner(lieu.nom)}
        choixDuLieu={<ChoisirLeLieuAFusionner structureId={structureId} />}
      />
    </ClientBinder>
  )
}

export default Page
