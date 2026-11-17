import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

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
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  redirect('/inscription/initialiser')
}

export default InscriptionPage
