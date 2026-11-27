import { notFound } from 'next/navigation'
import { fusionnerDesComptesAction } from '@/app/_actions/utilisateurs/fusionner-des-comptes.action'
import { rechercherDesComptesAFusionnerAction } from '@/app/_actions/utilisateurs/rechercher-des-comptes-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { FusionPage } from '@/features/utilisateurs/abilities/apercevoir-la-fusion-des-comptes/ui/pages/FusionPage'
import { ficheUtilisateur } from '@/features/utilisateurs/abilities/consulter-un-utilisateur/implementations/prisma/fiche-utilisateur.query'
import { FUSIONNER_DES_COMPTES_ACTION_KEY } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.key'
import { RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY } from '@/features/utilisateurs/abilities/rechercher-des-comptes-a-fusionner/action/rechercher-des-comptes-a-fusionner.key'
import { ChoixDuCompteAFusionner } from '@/features/utilisateurs/abilities/rechercher-des-comptes-a-fusionner/ui/slots/ChoixDuCompteAFusionner.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata = {
  title: metadataTitle('Utilisateurs - Fusion'),
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin()
  const { id } = await props.params
  const cible = await ficheUtilisateur({
    utilisateurId: id,
    maintenant: new Date(),
  })
  if (cible === null) notFound()

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
          cible={{ id: cible.id, nom: cible.nomAffiche }}
          apercu={null}
          choix={
            <ChoixDuCompteAFusionner cibleId={cible.id} compteChoisi={null} />
          }
          validation={null}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
