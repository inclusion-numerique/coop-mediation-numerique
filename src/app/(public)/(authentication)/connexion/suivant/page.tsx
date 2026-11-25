import { redirect } from 'next/navigation'
import { adresseDeRetourApresConnexion } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Cette page permet de rediriger l'utilisateur après une connexion réussie
 * si aucune redirection n'est spécifiée lors du signin.
 */
const Page = async () => {
  const user = await getSessionUser()

  redirect(adresseDeRetourApresConnexion(user))

  return null
}

export default Page
