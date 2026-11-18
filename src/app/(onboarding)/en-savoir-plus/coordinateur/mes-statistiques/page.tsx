import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingMesStatistiquesCoordinateur } from '@/app/(onboarding)/en-savoir-plus/coordinateur/mes-statistiques/OnboardingMesStatistiquesCoordinateur'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'

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
  return <OnboardingMesStatistiquesCoordinateur />
}

export default Page
