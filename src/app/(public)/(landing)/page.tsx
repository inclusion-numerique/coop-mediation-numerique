import { redirect } from 'next/navigation'
import { getHomepage } from '@/features/authentification/domain/getHomepage'
import { getSessionUser } from '@/features/authentification/implementation/session/getSessionUser'
import { isUserInscriptionEnCours } from '@/features/inscription/domain/isUserInscriptionEnCours'
import { LandingPage } from '@/features/vitrine/abilities/presenter-la-coop/ui/pages/LandingPage'

const Page = async () => {
  const user = await getSessionUser()
  if (user && !isUserInscriptionEnCours(user)) {
    redirect(getHomepage(user))
    return null
  }

  return <LandingPage />
}

export default Page
