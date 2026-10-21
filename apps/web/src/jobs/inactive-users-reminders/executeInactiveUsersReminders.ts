import { output } from '@app/cli/output'
import {
  lancerLesRelancesDesInscrits,
  lancerLesRelancesDInscription,
} from '@app/web/composition/utilisateurs/relances.ports'
import type { RapportDeRelance } from '@app/web/features/utilisateurs/domain'

const resume = (rapports: readonly RapportDeRelance[]) => ({
  traites: rapports.length,
  echecs: rapports.flatMap((rapport) =>
    rapport.issue === 'echec'
      ? [
          {
            utilisateurId: rapport.utilisateurId,
            action: rapport.action,
            cause: rapport.cause,
          },
        ]
      : [],
  ),
})

export const executeInactiveUsersReminders = async () => {
  output('Executing inactive users reminders job...')

  const maintenant = new Date()
  const inscriptions = resume(await lancerLesRelancesDInscription(maintenant))
  const inscrits = resume(await lancerLesRelancesDesInscrits(maintenant))

  output(
    `relances : ${inscriptions.traites} inscriptions inachevées (${inscriptions.echecs.length} échecs), ${inscrits.traites} inscrits sans activité (${inscrits.echecs.length} échecs)`,
  )

  return { success: true, inscriptions, inscrits }
}
