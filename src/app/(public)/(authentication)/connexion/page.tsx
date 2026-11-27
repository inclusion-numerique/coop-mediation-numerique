import type { Metadata } from 'next'
import { Route } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import {
  connexionParProConnect,
  getServerUrl,
} from '@/configuration/projet/serveur'
import { ConnexionPage } from '@/features/authentification/abilities/se-connecter/ui/pages/ConnexionPage'
import { moyenDeConnexionParCourriel } from '@/features/authentification/implementations/email/moyen-de-connexion-par-courriel.client'
import { moyenDeConnexionProConnect } from '@/features/authentification/implementations/proconnect/moyen-de-connexion-proconnect.client'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'

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
      connexion={
        connexionParProConnect()
          ? moyenDeConnexionProConnect.affichage
          : moyenDeConnexionParCourriel.affichage
      }
    />
  )
}

export default SigninPage
