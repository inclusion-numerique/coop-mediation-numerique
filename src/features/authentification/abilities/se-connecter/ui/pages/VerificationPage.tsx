import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { Breadcrumbs } from '@/libraries/ui/components'
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
