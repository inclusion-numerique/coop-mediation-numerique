import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { AccessibilitePage } from '@/features/legal/abilities/consulter-les-informations-legales/ui/pages/AccessibilitePage'

export const metadata: Metadata = {
  title: metadataTitle('Déclaration d’accessibilité'),
}

const Page = () => <AccessibilitePage />

export default Page
