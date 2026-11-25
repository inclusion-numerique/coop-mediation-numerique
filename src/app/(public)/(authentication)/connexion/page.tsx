import type { Metadata } from 'next'
import { Route } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { getServerUrl } from '@/configuration/projet/serveur'
import { ConnexionPage } from '@/features/authentification/abilities/se-connecter/ui/pages/ConnexionPage'
import { moyenDeConnexion } from '@/features/authentification/implementations/next-auth/authentication-provider.client'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: metadataTitle('Connexion'),
}

const SigninPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; suivant?: Route }>
}) => {
  const { error, suivant } = await searchParams
  const user = await getSessionUser()

  const callbackUrl = suivant ?? '/connexion/suivant'

  if (user) {
    redirect(getServerUrl(callbackUrl))
  }

  return (
    <ConnexionPage
      error={error}
      callbackUrl={callbackUrl}
      connexion={moyenDeConnexion}
    />
  )
}

export default SigninPage
