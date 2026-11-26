import type { Route } from 'next'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { Breadcrumbs } from '@/libraries/ui/components'
import SigninPanel, {
  type AffichageDeLaConnexion,
} from '../components/SigninPanel'

export const ConnexionPage = ({
  error,
  callbackUrl,
  connexion,
}: {
  error?: string | undefined
  callbackUrl: Route
  connexion: AffichageDeLaConnexion
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
