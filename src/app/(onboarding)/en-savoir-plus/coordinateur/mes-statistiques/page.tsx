import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { OnboardingMesStatistiquesCoordinateurPage } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/ui/pages/OnboardingMesStatistiquesCoordinateurPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus - Mes statistiques'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.coordinateur) {
    redirect('/coop')
  }
  return <OnboardingMesStatistiquesCoordinateurPage />
}

export default Page
