import { output } from '@app/cli/output'
import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import { libererDesEquipes } from '@app/web/features/equipe'
import { retirerDesLieux } from '@app/web/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import {
  hash,
  retirerDesListesDeDiffusion,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { identifiantsDe } from '@app/web/features/utilisateurs/domain'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'

export const executeInactiveUsersReminders = async () => {
  output('Executing inactive users reminders job...')

  await signupReminders()

  // Le couloir « inscrit mais jamais actif » efface des comptes à J+105 : il
  // passe donc par l'ability, et c'est ici — dans la couche application — que
  // les implémentations des étapes lui sont fournies. La feature qui décide
  // n'importe aucune des six features qui exécutent.
  await nouveauReminders({
    ports: {
      anonymiserPortefeuille,
      effacerEmpreinteRdv,
      retirerDesLieux,
      effacerNotes: ({ rattachements }) =>
        effacerNotes(identifiantsDe(rattachements)),
      libererDesEquipes: ({ rattachements }) =>
        libererDesEquipes(identifiantsDe(rattachements)),
      revoquerPartageStatistiques: ({ rattachements }) =>
        revoquerPartageStatistiques(identifiantsDe(rattachements)),
      retirerDesListesDeDiffusion,
      hash,
    },
  })

  return { success: true }
}
