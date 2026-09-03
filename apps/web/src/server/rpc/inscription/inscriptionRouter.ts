import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  createBrevoContact,
  deploymentCanCreateBrevoContact,
  toBrevoContact,
} from '@app/web/external-apis/brevo/createBrevoContact'
import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/inscription/implementation/prisma/employeuse-en-lieu.data'
import {
  ajouterDesLieuxActivite,
  lireLieuxDejaRattaches,
  trouverStructuresCarto,
} from '@app/web/features/lieux-activite'
import { LieuxActiviteValidation } from '@app/web/features/utilisateurs/use-cases/registration/LieuxActivite'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { ProfilInscription } from '@prisma/client'
import { v4 } from 'uuid'

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

      const upsertedMediateur = await prismaClient.mediateur.upsert({
        where: { userId: sessionUser.id },
        create: { userId: sessionUser.id },
        update: {},
      })

      if (
        sessionUser.inscriptionValidee != null &&
        deploymentCanCreateBrevoContact()
      ) {
        await createBrevoContact({
          contact: toBrevoContact({
            ...sessionUser,
            mediateur: { ...upsertedMediateur },
          }),
          listIds: [ServerWebAppConfig.Brevo.usersListId],
        })
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
