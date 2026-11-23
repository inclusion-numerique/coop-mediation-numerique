import type { Metadata } from 'next'
import { Route } from 'next'
import { redirect } from 'next/navigation'
import { getServerUrl } from '@/configuration/projet/baseUrl'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import SigninPanel from '@/features/authentification/abilities/se-connecter/ui/pages/SigninPanel'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import Breadcrumbs from '@/libraries/ui/components/Breadcrumbs'

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
    <>
      <SkipLinksPortal />
      <Breadcrumbs currentPage="Connexion" />
      <main id={contentId}>
        <SigninPanel error={error} callbackUrl={callbackUrl} />
      </main>
    </>
  )
}

export default SigninPage
