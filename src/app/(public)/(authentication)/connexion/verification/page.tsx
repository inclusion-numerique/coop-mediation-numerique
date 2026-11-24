import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerUrl } from '@/configuration/projet/base-url'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { VerificationPage } from '@/features/authentification/abilities/se-connecter/ui/pages/VerificationPage'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'

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
