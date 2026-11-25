'use client'

import { signaler } from '@/configuration/telemetry'
import { ServerError } from '@/features/navigation/ui/slots/ServerError.slot'

const Erreur = ({ error }: { error: Error & { digest?: string } }) => (
  <ServerError error={error} signaler={signaler} />
)

export default Erreur
