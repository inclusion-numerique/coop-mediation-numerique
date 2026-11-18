import { errorReporter } from '@/configuration/telemetry/error-reporter/server'
import { deploymentCanCreateBrevoContact } from '@/external-apis/brevo/createBrevoContact'
import {
  listeDeDiffusionPorts,
  synchroniserLesRolesBrevo,
} from '@/features/utilisateurs/abilities/synchroniser-les-roles-brevo'
import { output } from '@/libraries/console/output'

export const executeSynchroniserLesRolesBrevo = async () => {
  if (!deploymentCanCreateBrevoContact()) {
    output('Synchronisation Brevo ignorée hors du déploiement main')
    return { skipped: true }
  }

  const bilan = await synchroniserLesRolesBrevo(listeDeDiffusionPorts)

  output(
    `Rôles Brevo : ${bilan.inscrits} inscrits, ${bilan.importes} importés, ${bilan.retires} retirés, ${bilan.illisibles.length} illisibles, ${bilan.echecs.length} lots en échec`,
  )

  if (bilan.echecs.length > 0)
    errorReporter.captureMessage({
      message: `Synchronisation Brevo : ${bilan.echecs.length} lots en échec`,
      level: 'error',
    })

  return bilan
}
