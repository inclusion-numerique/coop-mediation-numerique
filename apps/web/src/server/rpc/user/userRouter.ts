import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'

export const userRouter = router({
  signupReminders: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      await signupReminders()
    },
  ),
  inactiveReminders: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      await nouveauReminders({
        ports: supprimerComptePorts,
      })
    },
  ),
  markOnboardingAsSeen: protectedProcedure.mutation(({ ctx: { user } }) =>
    prismaClient.user.update({
      where: { id: user.id },
      data: { hasSeenOnboarding: new Date() },
    }),
  ),
})
