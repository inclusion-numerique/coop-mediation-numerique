import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { InvitationValidation } from '@app/web/equipe/InvitationValidation'
import { InviterMembreValidation } from '@app/web/equipe/InviterMembreValidation'
import { acceptInvitation } from '@app/web/mediateurs/acceptInvitation'
import { declineInvitation } from '@app/web/mediateurs/declineInvitation'
import { findInvitationFrom } from '@app/web/mediateurs/findInvitationFrom'
import { inviteToJoinTeamOf } from '@app/web/mediateurs/inviteToJoinTeamOf'
import { leaveTeamOf } from '@app/web/mediateurs/leaveTeamOf'
import { removeMediateurFromTeamOf } from '@app/web/mediateurs/removeMediateurFromTeamOf'
import { searchMediateur } from '@app/web/mediateurs/searchMediateurs'
import { setVisibility } from '@app/web/mediateurs/setVisibility'
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
})
