import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { OnboardingMesOutilsCoordinateurPage } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/ui/pages/OnboardingMesOutilsCoordinateurPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus - Mes outils'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.coordinateur) {
    redirect('/coop')
  }

  return <OnboardingMesOutilsCoordinateurPage />
}

export default Page
