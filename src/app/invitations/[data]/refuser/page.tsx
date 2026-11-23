import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { default as InvitationRefusee } from '@/features/equipe/abilities/refuser-une-invitation/ui/pages/InvitationRefusee'

export const metadata: Metadata = {
  title: metadataTitle('Vous avez refusé de rejoindre cette équipe'),
}

const RefusInvitationPage = () => <InvitationRefusee />

export default RefusInvitationPage
