import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'
import { OnboardingMesOutilsCoordinateur } from './OnboardingMesOutilsCoordinateur'

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

  return <OnboardingMesOutilsCoordinateur />
}

export default Page
