import { inviterDesMembresAction } from '@app/web/app/_actions/equipe/inviter-des-membres.action'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '@app/web/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.key'
import { InviterMembresPage } from '@app/web/features/equipe/abilities/inviter-des-membres/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'

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
      <BackButton />
      <main id={contentId} className="fr-mb-16w">
        <ClientBinder
          bind={INVITER_DES_MEMBRES_ACTION_KEY}
          to={inviterDesMembresAction}
        >
          <InviterMembresPage />
        </ClientBinder>
      </main>
    </div>
  </div>
)

export default Page
