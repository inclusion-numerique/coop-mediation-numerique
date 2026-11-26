import { notFound } from 'next/navigation'
import { fusionnerDesLieuxAction } from '@/app/_actions/lieux-activite/fusionner-des-lieux.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { FUSIONNER_DES_LIEUX_ACTION_KEY } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.key'
import { apercevoirLaFusion } from '@/features/lieux-activite/abilities/fusionner-des-lieux/domain'
import { lieuxAApercevoir } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/lieux-a-apercevoir.query'
import { ApercuDeLaFusionPage } from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/pages/ApercuDeLaFusionPage'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata = {
  title: metadataTitle('Structures - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureId: string; mergeId: string }>
}) => {
  await authenticateAdmin()
  const { structureId, mergeId } = await props.params
  const apercu = await apercevoirLaFusion({ lieuxAApercevoir })({
    source: LieuId.safe(mergeId),
    cible: LieuId.safe(structureId),
  })
  if (!apercu.success) return notFound()

  return (
    <ClientBinder
      bind={FUSIONNER_DES_LIEUX_ACTION_KEY}
      to={fusionnerDesLieuxAction}
    >
      <ApercuDeLaFusionPage structureId={structureId} mergeData={apercu.data} />
    </ClientBinder>
  )
}

export default Page
