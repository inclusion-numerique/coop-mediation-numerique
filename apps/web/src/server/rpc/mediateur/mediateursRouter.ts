import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { InvitationValidation } from '@app/web/equipe/InvitationValidation'
import { InviterMembreValidation } from '@app/web/equipe/InviterMembreValidation'
import { togglePartageStatistiques } from '@app/web/features/mediateurs/use-cases/partage-statistiques/db/togglePartageStatistiques'
import { acceptInvitation } from '@app/web/mediateurs/acceptInvitation'
import { addUserToTeam } from '@app/web/mediateurs/addUserToTeam'
import { declineInvitation } from '@app/web/mediateurs/declineInvitation'
import { findInvitationFrom } from '@app/web/mediateurs/findInvitationFrom'
import { inviteToJoinTeamOf } from '@app/web/mediateurs/inviteToJoinTeamOf'
import { leaveTeamOf } from '@app/web/mediateurs/leaveTeamOf'
import { removeMediateurFromTeamOf } from '@app/web/mediateurs/removeMediateurFromTeamOf'
import { resendInvitation } from '@app/web/mediateurs/resendInvitation'
import { searchMediateur } from '@app/web/mediateurs/searchMediateurs'
import { setVisibility } from '@app/web/mediateurs/setVisibility'
import { prismaClient } from '@app/web/prismaClient'
import {
  protectedProcedure,
  publicProcedure,
  router,
} from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { z } from 'zod'

export const mediateursRouter = router({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query }, ctx: { user } }) => {
      if (!user.coordinateur && user.role !== 'Admin')
        throw forbiddenError('User is not a coordinateur')

      return searchMediateur({
        coordinateurId: user.coordinateur?.id,
        searchParams: { recherche: query },
      })
    }),
  removeFromTeam: protectedProcedure
    .input(z.object({ mediateurId: z.string() }))
    .mutation(async ({ input: { mediateurId }, ctx: { user } }) => {
      if (!isCoordinateur(user))
        throw forbiddenError('User is not a coordinateur')

      const stopwatch = createStopwatch()

      await removeMediateurFromTeamOf(user.coordinateur)(mediateurId)

      addMutationLog({
        userId: user.id,
        nom: 'SupprimerMediateurCoordonne',
        duration: stopwatch.stop().duration,
        data: {
          coordinateurId: user.coordinateur.id,
          mediateurId,
        },
      })
    }),
  leaveTeam: protectedProcedure
    .input(z.object({ coordinateurId: z.string() }))
    .mutation(async ({ input: { coordinateurId }, ctx: { user } }) => {
      if (!isMediateur(user)) throw forbiddenError('User is not a mediateur')

      const stopwatch = createStopwatch()

      await leaveTeamOf(user.mediateur)(coordinateurId)

      addMutationLog({
        userId: user.id,
        nom: 'SupprimerMediateurCoordonne',
        duration: stopwatch.stop().duration,
        data: {
          mediateurId: user.mediateur.id,
          coordinateurId,
        },
      })
    }),
  invite: protectedProcedure
    .input(InviterMembreValidation)
    .mutation(async ({ input: { members }, ctx: { user } }) => {
      if (!isCoordinateur(user))
        throw forbiddenError('User is not a coordinateur')

      const stopwatch = createStopwatch()

      await inviteToJoinTeamOf(user)(members)

      addMutationLog({
        userId: user.id,
        nom: 'InviterMediateursCoordonnes',
        duration: stopwatch.stop().duration,
        data: {
          coordinateurId: user.coordinateur.id,
          members,
        },
      })
    }),
  declineInvitation: publicProcedure
    .input(InvitationValidation)
    .mutation(async ({ input: { email, coordinateurId }, ctx: { user } }) => {
      const stopwatch = createStopwatch()

      const invitation = await findInvitationFrom(coordinateurId)(email)

      if (invitation == null)
        throw forbiddenError(
          'There is no invitation for this email matching coordinateurId',
        )

      await declineInvitation(invitation)

      addMutationLog({
        userId: user?.id ?? null,
        nom: 'RefuserInvitationMediateurCoordonne',
        duration: stopwatch.stop().duration,
        data: {
          email,
          coordinateurId,
        },
      })
    }),
  acceptInvitation: publicProcedure
    .input(InvitationValidation)
    .mutation(async ({ input: { email, coordinateurId }, ctx: { user } }) => {
      const stopwatch = createStopwatch()

      const invitation = await findInvitationFrom(coordinateurId)(email)

      if (invitation == null)
        throw forbiddenError(
          'There is no invitation for this email matching coordinateurId',
        )

      await acceptInvitation(invitation)

      addMutationLog({
        userId: user?.id ?? null,
        nom: 'AccepterInvitationMediateurCoordonne',
        duration: stopwatch.stop().duration,
        data: {
          email,
          coordinateurId,
        },
      })
    }),
  resendInvitation: protectedProcedure
    .input(z.object({ email: z.string(), coordinateurId: z.string() }))
    .mutation(async ({ input: { email, coordinateurId }, ctx: { user } }) => {
      if (user.role !== 'Admin') {
        if (!isCoordinateur(user))
          throw forbiddenError('User is not a coordinateur')

        if (user.coordinateur.id !== coordinateurId)
          throw forbiddenError('Coordinateur mismatch')
      }

      const coordinateurUser = await prismaClient.user.findFirst({
        where: {
          coordinateur: {
            id: coordinateurId,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })
      if (!coordinateurUser) throw forbiddenError('Coordinateur not found')

      const stopwatch = createStopwatch()

      await resendInvitation({
        email,
        coordinateurId,
        coordinateurName: coordinateurUser.name ?? 'Coordinateur', // fallback will never happen, here for type safety
      })

      addMutationLog({
        userId: user.id,
        nom: 'RenvoyerInvitationMediateurCoordonne' as const,
        duration: stopwatch.stop().duration,
        data: {
          email,
          coordinateurId,
        },
      })
    }),
  addToTeam: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(), // id du model User (pas Mediateur)
        coordinateurId: z.string().uuid(), // id du model Coordinateur (pas User)
      }),
    )
    .mutation(async ({ input: { userId, coordinateurId }, ctx: { user } }) => {
      // uniquement accessible par les admins
      if (user.role !== 'Admin') throw forbiddenError()

      return addUserToTeam({ userId, coordinateurId })
    }),
  setVisibility: protectedProcedure
    .input(z.object({ isVisible: z.boolean() }))
    .mutation(async ({ input: { isVisible }, ctx: { user } }) => {
      const stopwatch = createStopwatch()

      if (!isMediateur(user)) throw forbiddenError('User is not a mediateur')

      await setVisibility(user)(isVisible)

      addMutationLog({
        userId: user?.id ?? null,
        nom: 'SetMediateurVisibility',
        duration: stopwatch.stop().duration,
        data: {
          email: user.email,
          isVisible,
        },
      })
    }),
  shareStats: protectedProcedure.mutation(async ({ ctx: { user } }) => {
    const stopwatch = createStopwatch()

    if (!isMediateur(user)) throw forbiddenError('User is not a mediateur')

    const result = await togglePartageStatistiques(user.mediateur.id)

    addMutationLog({
      userId: user?.id ?? null,
      nom: 'SetMediateurVisibility',
      duration: stopwatch.stop().duration,
      data: {
        email: user.email,
      },
    })

    return result.active
  }),
})
