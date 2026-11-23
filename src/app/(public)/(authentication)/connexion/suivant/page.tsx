import { redirect } from 'next/navigation'
import { getLoginRedirectUrl } from '@/features/authentification/domain/getHomepage'
import { getSessionUser } from '@/features/authentification/implementations/session/getSessionUser'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Cette page permet de rediriger l'utilisateur après une connexion réussie
 * si aucune redirection n'est spécifiée lors du signin.
 */
const Page = async () => {
  const user = await getSessionUser()

  redirect(getLoginRedirectUrl(user))

  return null
}

export default Page
