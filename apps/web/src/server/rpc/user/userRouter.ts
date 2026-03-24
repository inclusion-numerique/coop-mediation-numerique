import { UtilisateurSetFeatureFlagsValidation } from '@app/web/app/administration/utilisateurs/[id]/UtilisateurSetFeatureFlagsValidation'
import { UpdateProfileValidation } from '@app/web/app/user/UpdateProfileValidation'
import { updateBrevoContact } from '@app/web/external-apis/brevo/updateBrevoContact'
import { deleteUser } from '@app/web/features/utilisateurs/use-cases/delete/deleteUser'
import { mergeUser } from '@app/web/features/utilisateurs/use-cases/merge/mergeUser'
import { nouveauReminders } from '@app/web/features/utilisateurs/use-cases/nouveau-reminders/nouveauReminders'
import { searchUser } from '@app/web/features/utilisateurs/use-cases/search/searchUser'
import { signupReminders } from '@app/web/features/utilisateurs/use-cases/signup-reminders/signupReminders'
import { updateUserFromDataspaceData } from '@app/web/features/utilisateurs/use-cases/update-from-dataspace/updateUserFromDataspaceData'
import { prismaClient } from '@app/web/prismaClient'
import {
  protectedProcedure,
  publicProcedure,
  router,
} from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { invalidError } from '@app/web/server/rpc/trpcErrors'
import { ChangeUserRolesValidation } from '@app/web/server/rpc/user/ChangeUserRolesValidation'
import { UserMergeValidation } from '@app/web/server/rpc/user/userMerge'
import { ServerUserSignupValidation } from '@app/web/server/rpc/user/userSignup.server'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { ProfilInscription } from '@prisma/client'
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
  deleteProfile: protectedProcedure.mutation(({ ctx: { user } }) =>
    deleteUser(user.id, user.email),
  ),
  adminDeleteUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input: { userId }, ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, deleted: true },
      })

      if (!user) throw invalidError('Utilisateur non trouvé')

      if (user.deleted) throw invalidError('Cet utilisateur est déjà supprimé')

      if (user.role === 'Admin' || user.role === 'Support') {
        throw invalidError(
          'Impossible de supprimer un administrateur ou support',
        )
      }

      return deleteUser(userId, user.email)
    }),
  markOnboardingAsSeen: protectedProcedure.mutation(({ ctx: { user } }) =>
    prismaClient.user.update({
      where: { id: user.id },
      data: { hasSeenOnboarding: new Date() },
    }),
  ),
  changeRoles: protectedProcedure
    .input(ChangeUserRolesValidation)
    .mutation(
      async ({
        input: { userId, isMediateur, isCoordinateur },
        ctx: { user: sessionUser },
      }) => {
        enforceIsAdmin(sessionUser)

        if (!isMediateur && !isCoordinateur) {
          throw invalidError('Au moins un rôle est requis')
        }

        const stopwatch = createStopwatch()

        const user = await prismaClient.user.findUnique({
          where: { id: userId, role: 'User' },
          select: {
            id: true,
            isConseillerNumerique: true,
            mediateur: {
              select: {
                id: true,
                beneficiairesCount: true,
                activitesCount: true,
              },
            },
            coordinateur: {
              select: {
                id: true,
                _count: {
                  select: {
                    mediateursCoordonnes: { where: { suppression: null } },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          throw invalidError('User not found or user is admin')
        }

        const currentIsMediateur = !!user.mediateur
        const currentIsCoordinateur = !!user.coordinateur

        // Add mediateur role if needed
        if (isMediateur && !currentIsMediateur) {
          await prismaClient.mediateur.create({
            data: { userId },
          })
        }

        // Add coordinateur role if needed
        if (isCoordinateur && !currentIsCoordinateur) {
          await prismaClient.coordinateur.create({
            data: { userId },
          })
        }

        // Remove mediateur role if needed
        if (!isMediateur && currentIsMediateur && user.mediateur) {
          if (
            user.mediateur.beneficiairesCount > 0 ||
            user.mediateur.activitesCount > 0
          ) {
            throw invalidError(
              'Impossible de retirer le rôle médiateur : des bénéficiaires ou activités existent',
            )
          }

          const mediateurId = user.mediateur.id
          await prismaClient.$transaction([
            prismaClient.mediateurCoordonne.deleteMany({
              where: { mediateurId },
            }),
            prismaClient.mediateurEnActivite.deleteMany({
              where: { mediateurId },
            }),
            prismaClient.invitationEquipe.deleteMany({
              where: { mediateurId },
            }),
            prismaClient.tag.deleteMany({
              where: { mediateurId },
            }),
            prismaClient.partageStatistiques.deleteMany({
              where: { mediateurId },
            }),
            prismaClient.mediateur.delete({
              where: { id: mediateurId },
            }),
          ])
        }

        // Remove coordinateur role if needed
        if (!isCoordinateur && currentIsCoordinateur && user.coordinateur) {
          if (user.coordinateur._count.mediateursCoordonnes > 0) {
            throw invalidError(
              'Impossible de retirer le rôle coordinateur : des médiateurs sont encore coordonnés',
            )
          }

          const coordinateurId = user.coordinateur.id
          await prismaClient.$transaction([
            prismaClient.mediateurCoordonne.deleteMany({
              where: { coordinateurId },
            }),
            prismaClient.invitationEquipe.deleteMany({
              where: { coordinateurId },
            }),
            prismaClient.tag.deleteMany({
              where: { coordinateurId },
            }),
            prismaClient.activiteCoordination.deleteMany({
              where: { coordinateurId },
            }),
            prismaClient.partageStatistiques.deleteMany({
              where: { coordinateurId },
            }),
            prismaClient.coordinateur.delete({
              where: { id: coordinateurId },
            }),
          ])
        }

        // Update profilInscription based on resulting roles
        let profilInscription: ProfilInscription | null = null
        if (isMediateur && isCoordinateur) {
          profilInscription = user.isConseillerNumerique
            ? 'ConseillerNumerique'
            : 'Mediateur'
        } else if (isMediateur) {
          profilInscription = user.isConseillerNumerique
            ? 'ConseillerNumerique'
            : 'Mediateur'
        } else if (isCoordinateur) {
          profilInscription = user.isConseillerNumerique
            ? 'CoordinateurConseillerNumerique'
            : 'Coordinateur'
        }

        const updated = await prismaClient.user.update({
          where: { id: userId },
          data: {
            profilInscription,
          },
        })

        addMutationLog({
          userId,
          nom: 'ChangerRoles',
          duration: stopwatch.stop().duration,
          data: {
            id: userId,
            isMediateur,
            isCoordinateur,
            previousIsMediateur: currentIsMediateur,
            previousIsCoordinateur: currentIsCoordinateur,
          },
        })

        // Update Brevo contact if roles changed
        const rolesChanged =
          isMediateur !== currentIsMediateur ||
          isCoordinateur !== currentIsCoordinateur
        if (rolesChanged) {
          await updateBrevoContact(userId)
        }

        return updated
      },
    ),
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
  logoutUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input: { userId }, ctx: { user: sessionUser } }) => {
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

      const { count: deletedSessionsCount } =
        await prismaClient.session.deleteMany({
          where: {
            userId,
          },
        })

      return {
        userId,
        deletedSessionsCount,
      }
    }),
  updateFromDataspace: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input: { userId }, ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)

      return updateUserFromDataspaceData({ userId })
    }),
})
