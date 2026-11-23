import { PropsWithChildren } from 'react'
import { CadreDesEtapes } from '@/features/inscription/ui/layouts/CadreDesEtapes'

const InscriptionStepsLayout = ({ children }: PropsWithChildren) => (
  <CadreDesEtapes>{children}</CadreDesEtapes>
)

export default InscriptionStepsLayout
