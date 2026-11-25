import { verifierEnvironnementServeurWeb } from '@/configuration/environnement/serveur'
import { register as enregistrerLaTelemetrie } from '@/configuration/telemetry/serveur'

export { onRequestError } from '@/configuration/telemetry/serveur'

export const register = async (): Promise<void> => {
  verifierEnvironnementServeurWeb()
  await enregistrerLaTelemetrie()
}
