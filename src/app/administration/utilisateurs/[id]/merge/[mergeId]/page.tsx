import { notFound } from 'next/navigation'
import { fusionnerDesComptesAction } from '@/app/_actions/utilisateurs/fusionner-des-comptes.action'
import { rechercherDesComptesAFusionnerAction } from '@/app/_actions/utilisateurs/rechercher-des-comptes-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import {
  FUSIONNER_DES_COMPTES_ACTION_KEY,
  RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY,
} from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.key'
import { apercevoirLaFusion } from '@/features/utilisateurs/abilities/fusionner-des-comptes/domain/apercevoir-la-fusion'
import { lireLesComptesAApercevoir } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/comptes-a-apercevoir.query'
import { FusionPage } from '@/features/utilisateurs/abilities/fusionner-des-comptes/ui/pages/FusionPage'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata = {
  title: metadataTitle('Utilisateurs - Fusion'),
}

const Page = async (props: {
  params: Promise<{ id: string; mergeId: string }>
}) => {
  await authenticateAdmin()
  const { id, mergeId } = await props.params
  const apercu = await apercevoirLaFusion({ lireLesComptesAApercevoir })({
    sourceId: UtilisateurId.safe(mergeId),
    cibleId: UtilisateurId.safe(id),
  })
  if (!apercu.success) notFound()

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
          cible={{ id: apercu.data.cible.id, nom: apercu.data.cible.nom }}
          apercu={apercu.data}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
