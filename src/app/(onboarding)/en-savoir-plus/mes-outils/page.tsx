import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'
import { OnboardingMesOutils } from './OnboardingMesOutils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus - Mes outils'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    redirect('/coop')
  }

  return <OnboardingMesOutils />
}

export default Page
