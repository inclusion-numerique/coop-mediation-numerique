import { errorReporter } from '@/configuration/telemetry/serveur'
import type { SignalerLaRevocationEchouee } from '../../domain/ports'

export const signalerLaRevocationEchouee: SignalerLaRevocationEchouee = ({
  agentId,
  erreur,
}) =>
  errorReporter.captureException({
    error: new Error('Révocation des jetons RDV Service Public impossible'),
    attributes: { agentId, erreur: JSON.stringify(erreur) },
  })
