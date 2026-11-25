import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { getServerUrl } from '@/configuration/projet/serveur'
import { VerificationPage } from '@/features/authentification/abilities/se-connecter/ui/pages/VerificationPage'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('Connexion'),
}

const VerifyPage = async () => {
  const user = await getSessionUser()
  if (user) {
    redirect(getServerUrl('/'))
  }

  return <VerificationPage />
}

export default VerifyPage
