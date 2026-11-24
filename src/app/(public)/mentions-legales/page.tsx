import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { MentionsLegalesPage } from '@/features/legal/ui/pages/MentionsLegalesPage'

export const metadata: Metadata = {
  title: metadataTitle('Mentions légales'),
}

const Page = () => <MentionsLegalesPage />

export default Page
