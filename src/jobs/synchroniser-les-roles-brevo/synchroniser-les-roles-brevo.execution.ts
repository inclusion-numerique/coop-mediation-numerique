import { brevoActif } from '@/configuration/brevo'
import { errorReporter } from '@/configuration/telemetry/serveur'
import { synchroniserLesRolesBrevo } from '@/features/utilisateurs/abilities/synchroniser-les-roles-brevo/implementations/synchroniser-les-roles-brevo.binding'
import { output } from '@/libraries/console'

export const executeSynchroniserLesRolesBrevo = async () => {
  if (!brevoActif()) {
    output('Synchronisation Brevo ignorée hors du déploiement main')
    return { skipped: true }
  }

  const bilan = await synchroniserLesRolesBrevo()

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
