import { PropsWithChildren } from 'react'
import { EtapesDeLInscriptionLayout } from '@/features/inscription/ui/layouts/EtapesDeLInscriptionLayout'

const InscriptionStepsLayout = ({ children }: PropsWithChildren) => (
  <EtapesDeLInscriptionLayout>{children}</EtapesDeLInscriptionLayout>
)

export default InscriptionStepsLayout
