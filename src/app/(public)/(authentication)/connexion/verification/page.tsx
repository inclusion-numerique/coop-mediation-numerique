import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Verify } from '@/app/(public)/(authentication)/connexion/verification/Verify'
import { metadataTitle } from '@/app/metadataTitle'
import { getSessionUser } from '@/auth/getSessionUser'
import { getServerUrl } from '@/configuration/projet/baseUrl'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import Breadcrumbs from '@/libraries/ui/components/Breadcrumbs'

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

  return (
    <>
      <SkipLinksPortal />
      <Breadcrumbs
        currentPage="Vérification"
        parents={[{ label: 'Connexion', linkProps: { href: '/connexion' } }]}
      />
      <main id={contentId}>
        <Verify />
      </main>
    </>
  )
}

export default VerifyPage
