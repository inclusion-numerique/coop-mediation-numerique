import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { default as InvitationRefuseePage } from '@/features/equipe/abilities/refuser-une-invitation/ui/pages/InvitationRefuseePage'

export const metadata: Metadata = {
  title: metadataTitle('Vous avez refusé de rejoindre cette équipe'),
}

const RefusInvitationPage = () => <InvitationRefuseePage />

export default RefusInvitationPage
