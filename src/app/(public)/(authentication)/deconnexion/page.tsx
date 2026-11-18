import Button from '@codegouvfr/react-dsfr/Button'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthCard } from '@/app/(public)/(authentication)/AuthCard'
import SignoutButton from '@/app/(public)/(authentication)/deconnexion/SignoutButton'
import { metadataTitle } from '@/app/metadataTitle'
import { getSessionUser } from '@/auth/getSessionUser'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'

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
      <AuthCard id={contentId} className="fr-text--center">
        <div
          className="fr-background-alt--blue-france fr-border-radius--16 fr-text-title--blue-france fr-display-inline-block fr-p-6v"
          aria-hidden="true"
        >
          <span className="fr-icon-logout-box-r-line fr-icon--lg" />
        </div>
        <div className="fr-my-10v">
          <h2 className="fr-h3 fr-text-title--blue-france fr-mb-1v">
            Déconnexion
          </h2>
          <p className="fr-text--lg fr-mb-0">
            Êtes-vous sûr de vouloir vous déconnecter&nbsp;?
          </p>
        </div>
        <div className="fr-btns-group fr-btns-group--lg">
          <SignoutButton />
          <Button
            className="fr-mb-0"
            linkProps={{ href: '/' }}
            priority="secondary"
          >
            Annuler
          </Button>
        </div>
      </AuthCard>
    </>
  )
}

export default SignoutPage
