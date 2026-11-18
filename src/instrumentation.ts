import { verifierEnvironnementServeurWeb } from '@/configuration/environnement/serveur'
import { register as enregistrerLaTelemetrie } from '@/configuration/telemetry/error-reporter/server'

export { onRequestError } from '@/configuration/telemetry/error-reporter/server'

export const register = async (): Promise<void> => {
  verifierEnvironnementServeurWeb()
  await enregistrerLaTelemetrie()
}
