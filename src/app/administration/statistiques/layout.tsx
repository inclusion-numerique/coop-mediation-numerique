import type { PropsWithChildren } from 'react'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { CadreDesStatistiquesNationales } from '@/features/statistiques/abilities/consulter-les-statistiques-nationales/ui/layouts/CadreDesStatistiquesNationales'

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdministrationStatistiquesLayout = ({ children }: PropsWithChildren) => (
  <CadreDesStatistiquesNationales>{children}</CadreDesStatistiquesNationales>
)

export default AdministrationStatistiquesLayout
