import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { DeconnexionPage } from '@/features/authentification/abilities/se-deconnecter/ui/pages/DeconnexionPage'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('Déconnexion'),
}

const SignoutPage = async () => {
  const user = await getSessionUser()
  if (!user) {
    redirect('/')
  }

  return <DeconnexionPage />
}

export default SignoutPage
