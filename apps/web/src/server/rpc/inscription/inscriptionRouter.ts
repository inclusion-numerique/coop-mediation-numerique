import type { SessionUser } from '@app/web/auth/sessionUser'
import { updateBrevoContact } from '@app/web/external-apis/brevo/updateBrevoContact'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'

const inscriptionGuard = (
  targetUserId: string,
  grantee: Pick<SessionUser, 'role' | 'id'>,
) => {
  if (grantee.role !== 'Admin' && grantee.id !== targetUserId) {
    throw forbiddenError()
  }
}

export const inscriptionRouter = router({
  addMediationNumeriqueToCoordinateur: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      inscriptionGuard(sessionUser.id, sessionUser)

      if (!sessionUser.coordinateur) {
        throw forbiddenError()
      }

      const stopwatch = createStopwatch()

      await prismaClient.mediateur.upsert({
        where: { userId: sessionUser.id },
        create: { userId: sessionUser.id },
        update: {},
      })

      // Relit le compte en base : la session ne porte pas les contrats bruts. Coordinateur ET
      // médiateur ici, le contact a toujours un rôle — même effet que l'upsert direct d'avant.
      if (sessionUser.inscriptionValidee != null) {
        await updateBrevoContact(sessionUser.id)
      }

      // V1 import logic removed - Dataspace is now source of truth

      addMutationLog({
        userId: sessionUser.id,
        nom: 'CreerMediateur',
        duration: stopwatch.stop().duration,
        data: {
          coordinateurId: sessionUser.coordinateur.id,
        },
      })
    },
  ),
})
