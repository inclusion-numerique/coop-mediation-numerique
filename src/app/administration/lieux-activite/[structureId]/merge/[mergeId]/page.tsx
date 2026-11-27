import { notFound } from 'next/navigation'
import { fusionnerDesLieuxAction } from '@/app/_actions/lieux-activite/fusionner-des-lieux.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { apercevoirLaFusion } from '@/features/lieux-activite/abilities/apercevoir-la-fusion/domain'
import { lieuxAApercevoir } from '@/features/lieux-activite/abilities/apercevoir-la-fusion/implementations/prisma/lieux-a-apercevoir.query'
import { ApercuDeLaFusionPage } from '@/features/lieux-activite/abilities/apercevoir-la-fusion/ui/pages/ApercuDeLaFusionPage'
import { lieuChoisiParDefaut } from '@/features/lieux-activite/abilities/apercevoir-la-fusion/ui/presenters/lieu-choisi-par-defaut.presenter'
import { FUSIONNER_DES_LIEUX_ACTION_KEY } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.key'
import ValiderLaFusion from '@/features/lieux-activite/abilities/fusionner-des-lieux/ui/slots/ValiderLaFusion.slot'
import { ChoisirLeLieuAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/ui/slots/ChoisirLeLieuAFusionner.slot'
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
      <ApercuDeLaFusionPage
        structureId={structureId}
        mergeData={apercu.data}
        choixDuLieu={
          <ChoisirLeLieuAFusionner
            structureId={structureId}
            defaultMergeStructure={lieuChoisiParDefaut(apercu.data)}
          />
        }
        validation={
          <ValiderLaFusion
            sourceStructure={apercu.data.mergeSource}
            targetStructure={apercu.data.mergeTarget}
          />
        }
      />
    </ClientBinder>
  )
}

export default Page
