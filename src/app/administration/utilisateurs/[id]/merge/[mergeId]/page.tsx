import { fusionnerDesComptesAction } from '@app/web/app/_actions/utilisateurs/fusionner-des-comptes.action'
import { rechercherDesComptesAFusionnerAction } from '@app/web/app/_actions/utilisateurs/rechercher-des-comptes-a-fusionner.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { apercuDeFusion } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes'
import {
  FUSIONNER_DES_COMPTES_ACTION_KEY,
  RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY,
} from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.key'
import { FusionPage } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Utilisateurs - Fusion'),
}

const Page = async (props: {
  params: Promise<{ id: string; mergeId: string }>
}) => {
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
