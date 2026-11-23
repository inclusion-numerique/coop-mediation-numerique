import { PropsWithChildren } from 'react'
import { CadreDAjoutDeLieux } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/layouts/CadreDAjoutDeLieux'

const LieuActiviteFullWidthLayout = ({ children }: PropsWithChildren) => (
  <CadreDAjoutDeLieux>{children}</CadreDAjoutDeLieux>
)

export default LieuActiviteFullWidthLayout
