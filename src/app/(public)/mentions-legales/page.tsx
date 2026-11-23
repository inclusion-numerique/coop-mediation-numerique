import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { MentionsLegalesPage } from '@/features/legal/abilities/consulter-les-informations-legales/ui/pages/MentionsLegalesPage'

export const metadata: Metadata = {
  title: metadataTitle('Mentions légales'),
}

const Page = () => <MentionsLegalesPage />

export default Page
