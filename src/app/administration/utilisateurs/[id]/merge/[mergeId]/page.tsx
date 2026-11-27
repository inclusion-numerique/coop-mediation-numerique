import { notFound } from 'next/navigation'
import { fusionnerDesComptesAction } from '@/app/_actions/utilisateurs/fusionner-des-comptes.action'
import { rechercherDesComptesAFusionnerAction } from '@/app/_actions/utilisateurs/rechercher-des-comptes-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { apercevoirLaFusionDesComptes } from '@/features/utilisateurs/abilities/apercevoir-la-fusion-des-comptes/domain/apercevoir-la-fusion-des-comptes'
import { lireLesComptesAApercevoir } from '@/features/utilisateurs/abilities/apercevoir-la-fusion-des-comptes/implementations/prisma/comptes-a-apercevoir.query'
import { FusionPage } from '@/features/utilisateurs/abilities/apercevoir-la-fusion-des-comptes/ui/pages/FusionPage'
import { FUSIONNER_DES_COMPTES_ACTION_KEY } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.key'
import { BoutonValiderLaFusion } from '@/features/utilisateurs/abilities/fusionner-des-comptes/ui/slots/BoutonValiderLaFusion.slot'
import { RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY } from '@/features/utilisateurs/abilities/rechercher-des-comptes-a-fusionner/action/rechercher-des-comptes-a-fusionner.key'
import { ChoixDuCompteAFusionner } from '@/features/utilisateurs/abilities/rechercher-des-comptes-a-fusionner/ui/slots/ChoixDuCompteAFusionner.slot'
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
  const apercu = await apercevoirLaFusionDesComptes({
    lireLesComptesAApercevoir,
  })({
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
          choix={
            <ChoixDuCompteAFusionner
              cibleId={apercu.data.cible.id}
              compteChoisi={apercu.data.source}
            />
          }
          validation={
            <BoutonValiderLaFusion
              source={apercu.data.source}
              cible={apercu.data.cible}
            />
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
