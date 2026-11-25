import type { Metadata } from 'next'
import { inviterDesMembresAction } from '@/app/_actions/equipe/inviter-des-membres.action'
import { rechercherDesMediateursAInviterAction } from '@/app/_actions/equipe/rechercher-des-mediateurs-a-inviter.action'
import { metadataTitle } from '@/configuration/projet'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '@/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.key'
import { RECHERCHER_DES_MEDIATEURS_A_INVITER_ACTION_KEY } from '@/features/equipe/abilities/inviter-des-membres/action/rechercher-des-mediateurs-a-inviter.key'
import { InviterMembresPage } from '@/features/equipe/abilities/inviter-des-membres/ui/pages/InviterMembresPage'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle('Inviter des membres - Mon équipe'),
}

const Page = () => (
  <ClientBinder
    bind={INVITER_DES_MEMBRES_ACTION_KEY}
    to={inviterDesMembresAction}
  >
    <ClientBinder
      bind={RECHERCHER_DES_MEDIATEURS_A_INVITER_ACTION_KEY}
      to={rechercherDesMediateursAInviterAction}
    >
      <InviterMembresPage />
    </ClientBinder>
  </ClientBinder>
)

export default Page
