import { effacerNotes } from '@/features/activites/abilities/effacer-notes'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@/features/equipe'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte'
import { lancerLesRelancesDInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees'
import { lancerLesRelancesDesInscrits } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs'
import {
  hash,
  retirerDesListesDeDiffusion,
  type SupprimerComptePorts,
  supprimerUnInscritJamaisActif,
} from '@/features/utilisateurs/abilities/supprimer-compte'
import type { RapportDeRelance } from '@/features/utilisateurs/domain'
import { output } from '@/libraries/console/output'
import {
  retirerDuRegistre,
  synchroniserPersonne,
} from '@/libraries/registre-personne'

const supprimerComptePorts: SupprimerComptePorts = {
  anonymiserPortefeuille,
  effacerNotes,
  effacerEmpreinteRdv,
  retirerLesTagsDUnCompte,
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques,
  retirerDesListesDeDiffusion,
  hash,
}

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
  const inscriptions = resume(
    await lancerLesRelancesDInscription(maintenant, retirerDuRegistre),
  )
  const inscrits = resume(
    await lancerLesRelancesDesInscrits(
      maintenant,
      supprimerUnInscritJamaisActif(
        supprimerComptePorts,
        maintenant,
        synchroniserPersonne,
      ),
    ),
  )

  output(
    `relances : ${inscriptions.traites} inscriptions inachevées (${inscriptions.echecs.length} échecs), ${inscrits.traites} inscrits sans activité (${inscrits.echecs.length} échecs)`,
  )

  return { success: true, inscriptions, inscrits }
}
