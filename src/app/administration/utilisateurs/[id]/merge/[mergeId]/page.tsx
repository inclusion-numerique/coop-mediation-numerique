import { notFound } from 'next/navigation'
import { fusionnerDesComptesAction } from '@/app/_actions/utilisateurs/fusionner-des-comptes.action'
import { rechercherDesComptesAFusionnerAction } from '@/app/_actions/utilisateurs/rechercher-des-comptes-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import {
  FUSIONNER_DES_COMPTES_ACTION_KEY,
  RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY,
} from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.key'
import { apercuDeFusion } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/apercu-de-fusion.query'
import { FusionPage } from '@/features/utilisateurs/abilities/fusionner-des-comptes/ui/pages/FusionPage'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata = {
  title: metadataTitle('Utilisateurs - Fusion'),
}

const Page = async (props: {
  params: Promise<{ id: string; mergeId: string }>
}) => {
  await authenticateAdmin()
  const { id, mergeId } = await props.params
  const apercu = await apercuDeFusion({ sourceId: mergeId, cibleId: id })
  if (apercu === null) notFound()

  return (
    <ClientBinder
      bind={RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY}
      to={rechercherDesComptesAFusionnerAction}
    >
      <ClientBinder
        bind={FUSIONNER_DES_COMPTES_ACTION_KEY}
        to={fusionnerDesComptesAction}
      >
        <FusionPage
          cible={{ id: apercu.cible.id, nom: apercu.cible.nom }}
          apercu={apercu}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
