import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'
import { InviterMembresPage } from './InviterMembresPage'

export const metadata: Metadata = {
  title: metadataTitle('Inviter des membres - Mon équipe'),
}

const Page = () => (
  <div
    className="fr-flex fr-direction-column fr-background-alt--blue-ecume"
    style={{ minHeight: '100%' }}
  >
    <SkipLinksPortal />
    <div className="fr-container fr-container--narrow">
      <CoopBreadcrumbs
        parents={[
          {
            label: 'Mon équipe',
            linkProps: { href: '/coop/mon-equipe/' },
          },
        ]}
        currentPage="Inviter des membres"
      />
      <BackButton href="/coop/mon-equipe">Retour à la liste</BackButton>
      <main id={contentId} className="fr-mb-16w">
        <InviterMembresPage />
      </main>
    </div>
  </div>
)

export default Page
