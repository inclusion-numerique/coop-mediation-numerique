import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingMonEquipeCoordinateur } from '@/app/(onboarding)/en-savoir-plus/coordinateur/mon-equipe/OnboardingMonEquipeCoordinateur'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus - Mon équipe'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.coordinateur) {
    redirect('/coop')
  }

  return <OnboardingMonEquipeCoordinateur />
}

export default Page
