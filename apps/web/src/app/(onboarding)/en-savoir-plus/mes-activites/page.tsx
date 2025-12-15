import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OnboardingMesActivites } from './OnboardingMesActivites'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus - Mes activités'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    redirect('/coop')
  }

  return (
    <OnboardingMesActivites
      isConseillerNumerique={user.mediateur.conseillerNumerique?.id != null}
    />
  )
}

export default Page
