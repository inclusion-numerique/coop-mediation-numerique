import { output } from '@app/cli/output'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'

export const executeInactiveUsersReminders = async () => {
  output('Executing inactive users reminders job...')

  await signupReminders()
  await nouveauReminders()

  return { success: true }
}
