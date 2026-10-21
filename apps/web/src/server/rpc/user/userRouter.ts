import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import { mergeUser } from '@app/web/features/utilisateurs/use-cases/merge/mergeUser'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { searchUser } from '@app/web/features/utilisateurs/use-cases/search/searchUser'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { UserMergeValidation } from '@app/web/server/rpc/user/userMerge'
import { z } from 'zod'

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
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        includeDeleted: z.boolean().optional().default(false),
        excludeUserIds: z.array(z.string()).optional().default([]),
        onlyMediateurs: z.boolean().optional().default(false),
      }),
    )
    .query(
      ({
        input: { query, includeDeleted, excludeUserIds, onlyMediateurs },
        ctx: { user: sessionUser },
      }) => {
        enforceIsAdmin(sessionUser)

        return searchUser({
          searchParams: {
            recherche: query,
          },
          includeDeleted,
          excludeUserIds,
          onlyMediateurs,
        })
      },
    ),
  merge: protectedProcedure
    .input(UserMergeValidation)
    .mutation(
      async ({
        input: { sourceUserId, targetUserId },
        ctx: { user: sessionUser },
      }) => {
        enforceIsAdmin(sessionUser)

        return mergeUser(sourceUserId, targetUserId)
      },
    ),
})
