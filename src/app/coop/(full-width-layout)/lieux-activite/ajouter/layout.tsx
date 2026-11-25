import { PropsWithChildren } from 'react'
import { AjoutDeLieuxLayout } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/layouts/AjoutDeLieuxLayout'

const LieuActiviteFullWidthLayout = ({ children }: PropsWithChildren) => (
  <AjoutDeLieuxLayout>{children}</AjoutDeLieuxLayout>
)

export default LieuActiviteFullWidthLayout
