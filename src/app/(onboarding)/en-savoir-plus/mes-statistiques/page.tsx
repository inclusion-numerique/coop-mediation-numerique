import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { OnboardingMesStatistiquesPage } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/ui/pages/OnboardingMesStatistiquesPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus - Mes statistiques'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    redirect('/coop')
  }

  return <OnboardingMesStatistiquesPage />
}

export default Page
