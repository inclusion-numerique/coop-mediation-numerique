import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { ConfidentialitePage } from '@/features/legal/ui/pages/ConfidentialitePage'

export const metadata: Metadata = {
  title: metadataTitle('Politique de confidentialité'),
}

const Page = () => <ConfidentialitePage />

export default Page
