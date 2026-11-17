import { metadataTitle } from '@app/web/app/metadataTitle'
import { InvitationRefusee } from '@app/web/features/equipe/abilities/refuser-une-invitation/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Vous avez refusé de rejoindre cette équipe'),
}

const RefusInvitationPage = () => <InvitationRefusee />

export default RefusInvitationPage
