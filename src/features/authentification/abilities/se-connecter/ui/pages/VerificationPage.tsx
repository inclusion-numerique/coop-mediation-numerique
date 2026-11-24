import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import Breadcrumbs from '@/libraries/ui/components/Breadcrumbs'
import { Verify } from '../components/Verify'

export const VerificationPage = () => (
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
