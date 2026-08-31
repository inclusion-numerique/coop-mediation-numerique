import { output } from '@app/cli/output'
import { chargesEffacement } from '@app/web/app/_actions/utilisateurs/charges-effacement'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'

export const executeInactiveUsersReminders = async () => {
  output('Executing inactive users reminders job...')

  await signupReminders()

  // Le couloir « inscrit mais jamais actif » efface des comptes à J+105 : il
  // passe donc par l'ability, et c'est ici — dans la couche application — que
  // les implémentations des charges lui sont fournies. La feature qui décide
  // n'importe aucune des six features qui exécutent.
  await nouveauReminders({ charges: chargesEffacement })

  return { success: true }
}
