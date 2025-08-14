import { AuthCard } from '@app/web/app/(public)/(authentication)/AuthCard'
import SignoutButton from '@app/web/app/(public)/(authentication)/deconnexion/SignoutButton'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import Breadcrumbs from '@app/web/components/Breadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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

  return (
    <>
      <SkipLinksPortal />
      <Breadcrumbs currentPage="Déconnexion" />
      <AuthCard id={contentId}>
        <h2>Déconnexion</h2>
        <p>Êtes-vous sûr·e de vouloir vous déconnecter&nbsp;?</p>
        <div className="fr-width-full">
          <SignoutButton className="fr-width-full fr-flex fr-justify-content-center fr-mb-6v" />
        </div>
        <div className="fr-grid-row fr-grid-row--center">
          <Link href="/">Retour</Link>
        </div>
      </AuthCard>
    </>
  )
}

export default SignoutPage
