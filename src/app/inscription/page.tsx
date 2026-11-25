import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Inscription'),
}

const InscriptionPage = async () => {
  const user = await authenticateUser()

  // L’inscription n’est complète qu’avec un profil de rôle : un compte
  // « validé » sans profil doit pouvoir reprendre le parcours au lieu de
  // boucler entre /coop et /connexion
  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  redirect('/inscription/initialiser')
}

export default InscriptionPage
