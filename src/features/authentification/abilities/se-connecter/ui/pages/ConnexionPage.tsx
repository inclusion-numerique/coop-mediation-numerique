import type { Route } from 'next'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import Breadcrumbs from '@/libraries/ui/components/Breadcrumbs'
import SigninPanel, { type MoyenDeConnexion } from '../components/SigninPanel'

export const ConnexionPage = ({
  error,
  callbackUrl,
  connexion,
}: {
  error?: string | undefined
  callbackUrl: Route
  connexion: MoyenDeConnexion
}) => (
  <>
    <SkipLinksPortal />
    <Breadcrumbs currentPage="Connexion" />
    <main id={contentId}>
      <SigninPanel
        error={error}
        callbackUrl={callbackUrl}
        connexion={connexion}
      />
    </main>
  </>
)
