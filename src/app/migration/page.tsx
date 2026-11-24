import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { MigrationPage } from '@/features/vitrine/ui/pages/MigrationPage'

export const metadata: Metadata = {
  title: metadataTitle('Migration vers la nouvelle version de la plateforme !'),
}

const Page = () => <MigrationPage />

export default Page
