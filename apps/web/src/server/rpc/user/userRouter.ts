import { createHash } from 'node:crypto'
import { UtilisateurSetFeatureFlagsValidation } from '@app/web/app/administration/utilisateurs/[id]/UtilisateurSetFeatureFlagsValidation'
import { UpdateProfileValidation } from '@app/web/app/user/UpdateProfileValidation'
import { mergeUser } from '@app/web/features/utilisateurs/use-cases/merge/mergeUser'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { searchUser } from '@app/web/features/utilisateurs/use-cases/search/searchUser'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'
import { prismaClient } from '@app/web/prismaClient'
import {
  protectedProcedure,
  publicProcedure,
  router,
} from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { invalidError } from '@app/web/server/rpc/trpcErrors'
import { ResetInscriptionUtilisateurValidation } from '@app/web/server/rpc/user/ResetInscriptionUtilisateur'
import { UserMergeValidation } from '@app/web/server/rpc/user/userMerge'
import { ServerUserSignupValidation } from '@app/web/server/rpc/user/userSignup.server'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { v4 } from 'uuid'
import { z } from 'zod'

export const userRouter = router({
  signup: publicProcedure
    .input(ServerUserSignupValidation)
    .mutation(({ input: { firstName, lastName, email } }) =>
      prismaClient.user.create({
        data: {
          id: v4(),
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
        },
        select: {
          id: true,
          email: true,
        },
      }),
    ),
  signupReminders: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      await signupReminders()
    },
  ),
  inactiveReminders: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      await nouveauReminders()
    },
  ),
  updateProfile: protectedProcedure
    .input(UpdateProfileValidation)
    .mutation(
      async ({ input: { firstName, lastName, phone }, ctx: { user } }) => {
        const stopwatch = createStopwatch()
        const updated = await prismaClient.user.update({
          where: { id: user.id },
          data: {
            firstName,
            lastName,
            phone: fixTelephone(phone ?? null),
            name: `${firstName} ${lastName}`,
          },
        })
        addMutationLog({
          userId: user.id,
          nom: 'ModifierUtilisateur',
          duration: stopwatch.stop().duration,
          data: {
            id: user.id,
            firstName,
            lastName,
            phone,
          },
        })
        return updated
      },
    ),
  deleteProfile: protectedProcedure.mutation(({ ctx: { user } }) => {
    const hash = createHash('sha256')
      .update(`${user.id}-${user.email}`)
      .digest('base64url')
      .slice(0, 12)

    return prismaClient.user.update({
      where: { id: user.id },
      data: {
        deleted: new Date(),
        email: `deleted+${hash}@coop-numerique.anct.gouv.fr`,
        firstName: 'Utilisateur',
        lastName: 'Supprimé',
        name: 'Utilisateur Supprimé',
        phone: null,
      },
    })
  }),
  markOnboardingAsSeen: protectedProcedure.mutation(({ ctx: { user } }) =>
    prismaClient.user.update({
      where: { id: user.id },
      data: { hasSeenOnboarding: new Date() },
    }),
  ),
  resetInscription: protectedProcedure
    .input(ResetInscriptionUtilisateurValidation)
    .mutation(async ({ input: { userId }, ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      const stopwatch = createStopwatch()

      const updated = await prismaClient.user.update({
        where: {
          id: userId,
          role: 'User',
        },
        data: {
          hasSeenOnboarding: null,
          acceptationCgu: null,
          inscriptionValidee: null,
          donneesConseillerNumeriqueV1Importees: null,
          profilInscription: null,
          structureEmployeuseRenseignee: null,
        },
      })

      if (!updated) {
        throw invalidError('User not found or user is admin')
      }

      addMutationLog({
        userId,
        nom: 'ResetInscription',
        duration: stopwatch.stop().duration,
        data: {
          id: userId,
        },
      })

      return updated
    }),
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        includeDeleted: z.boolean().optional().default(false),
        excludeUserIds: z.array(z.string()).optional().default([]),
      }),
    )
    .query(
      ({
        input: { query, includeDeleted, excludeUserIds },
        ctx: { user: sessionUser },
      }) => {
        enforceIsAdmin(sessionUser)

        return searchUser({
          searchParams: {
            recherche: query,
          },
          includeDeleted,
          excludeUserIds,
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
  setFeatureFlags: protectedProcedure
    .input(UtilisateurSetFeatureFlagsValidation)
    .mutation(
      async ({
        input: { featureFlags, userId },
        ctx: { user: sessionUser },
      }) => {
        enforceIsAdmin(sessionUser)

        const user = await prismaClient.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        })
        if (!user) {
          throw invalidError('User not found')
        }

        const updated = await prismaClient.user.update({
          where: {
            id: userId,
          },
          data: {
            featureFlags,
          },
          select: {
            id: true,
            featureFlags: true,
          },
        })

        return updated
      },
    ),
})
