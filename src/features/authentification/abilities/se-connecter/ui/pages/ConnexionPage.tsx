import type { Route } from 'next'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import Breadcrumbs from '@/libraries/ui/components/Breadcrumbs'
import SigninPanel from '../components/SigninPanel'

export const ConnexionPage = ({
  error,
  callbackUrl,
}: {
  error?: string
  callbackUrl: Route
}) => (
  <>
    <SkipLinksPortal />
    <Breadcrumbs currentPage="Connexion" />
    <main id={contentId}>
      <SigninPanel error={error} callbackUrl={callbackUrl} />
    </main>
  </>
)
