import type { Metadata } from 'next'
import { metadataTitle } from '@/app/metadataTitle'
import { InvitationRefusee } from '@/features/equipe/abilities/refuser-une-invitation/ui'

export const metadata: Metadata = {
  title: metadataTitle('Vous avez refusé de rejoindre cette équipe'),
}

const RefusInvitationPage = () => <InvitationRefusee />

export default RefusInvitationPage
