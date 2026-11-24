import type { PropsWithChildren } from 'react'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { StatistiquesNationalesLayout } from '@/features/statistiques/ui/layouts/StatistiquesNationalesLayout'

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdministrationStatistiquesLayout = ({ children }: PropsWithChildren) => (
  <StatistiquesNationalesLayout>{children}</StatistiquesNationalesLayout>
)

export default AdministrationStatistiquesLayout
