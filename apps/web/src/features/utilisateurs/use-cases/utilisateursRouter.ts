import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { signupReminders } from './signup-reminders/signupReminders'

export const utilisateursRouter = router({
  signupReminders: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      await signupReminders()
    },
  ),
})
