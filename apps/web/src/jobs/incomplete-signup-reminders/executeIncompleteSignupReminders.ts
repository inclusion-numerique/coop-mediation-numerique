import { output } from '@app/cli/output'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'

export const executeIncompleteSignupReminders = async () => {
  output('Executing incomplete signup reminders job...')

  await signupReminders()

  return { success: true }
}
