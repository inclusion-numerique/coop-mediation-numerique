import type { PropsWithChildren } from 'react'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { StatistiquesNationalesLayout } from '@/features/statistiques/abilities/consulter-les-statistiques-nationales/ui/layouts/StatistiquesNationalesLayout'

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdministrationStatistiquesLayout = ({ children }: PropsWithChildren) => (
  <StatistiquesNationalesLayout>{children}</StatistiquesNationalesLayout>
)

export default AdministrationStatistiquesLayout
