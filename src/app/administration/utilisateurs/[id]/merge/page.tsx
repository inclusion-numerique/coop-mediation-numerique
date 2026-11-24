import { notFound } from 'next/navigation'
import { fusionnerDesComptesAction } from '@/app/_actions/utilisateurs/fusionner-des-comptes.action'
import { rechercherDesComptesAFusionnerAction } from '@/app/_actions/utilisateurs/rechercher-des-comptes-a-fusionner.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { ficheUtilisateur } from '@/features/utilisateurs/abilities/consulter-un-utilisateur/implementations/prisma/fiche-utilisateur.query'
import {
  FUSIONNER_DES_COMPTES_ACTION_KEY,
  RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY,
} from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.key'
import { FusionPage } from '@/features/utilisateurs/abilities/fusionner-des-comptes/ui/pages/FusionPage'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
