import { inviterDesMembresAction } from '@app/web/app/_actions/equipe/inviter-des-membres.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '@app/web/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.key'
import { InviterMembresPage } from '@app/web/features/equipe/abilities/inviter-des-membres/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Inviter des membres - Mon équipe'),
}

const Page = () => (
  <ClientBinder
    bind={INVITER_DES_MEMBRES_ACTION_KEY}
    to={inviterDesMembresAction}
  >
    <InviterMembresPage />
  </ClientBinder>
)

export default Page
