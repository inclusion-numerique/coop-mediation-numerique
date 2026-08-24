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
  ajouterLieuxActivite,
  CREATE_MEDIATEUR_EN_ACTIVITE_KEY,
  CREATE_STRUCTURE_FROM_CARTO_KEY,
  CREATE_STRUCTURE_FROM_DATA_KEY,
  FIND_CARTO_STRUCTURE_KEY,
  FIND_EXISTING_LIEUX_ACTIVITES_KEY,
  FIND_STRUCTURES_BY_CARTO_IDS_KEY,
} from '@app/web/features/lieux-activite/use-cases/ajouter/domain'
import {
  createMediateurEnActivite,
  createStructureFromCarto,
  createStructureFromData,
  findCartoStructure,
  findExistingLieuxActivite,
  findStructuresByCartoIds,
  PRISMA_CLIENT_KEY,
} from '@app/web/features/lieux-activite/use-cases/ajouter/implementations/prisma'
import { ChoisirProfilEtAccepterCguValidation } from '@app/web/features/utilisateurs/use-cases/registration/ChoisirProfilEtAccepterCguValidation'
import { LieuxActiviteValidation } from '@app/web/features/utilisateurs/use-cases/registration/LieuxActivite'
import { StructureEmployeuseLieuActiviteValidation } from '@app/web/features/utilisateurs/use-cases/registration/StructureEmployeuseLieuActivite'
import { ValiderInscriptionValidation } from '@app/web/features/utilisateurs/use-cases/registration/ValiderInscriptionValidation'
import { provide, runWithContainer } from '@app/web/libs/injection'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { findCartoStructuresByIds } from '@app/web/structure/cartoStructureFromEntrepot'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
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
  ajouterLieuxActivite: protectedProcedure
    .input(LieuxActiviteValidation)
    .mutation(
      async ({
        input: { userId, lieuxActivite },
        ctx: { user: sessionUser },
      }) => {
        inscriptionGuard(userId, sessionUser)

        const mediateur = await prismaClient.mediateur.findUnique({
          where: { userId },
          select: { id: true },
        })

        if (!mediateur) {
          throw forbiddenError("L'utilisateur n'est pas un médiateur")
        }

        return prismaClient.$transaction((tx) =>
          runWithContainer(async () => {
            provide(PRISMA_CLIENT_KEY, tx)
            provide(
              FIND_EXISTING_LIEUX_ACTIVITES_KEY,
              findExistingLieuxActivite,
            )
            provide(FIND_STRUCTURES_BY_CARTO_IDS_KEY, findStructuresByCartoIds)
            provide(FIND_CARTO_STRUCTURE_KEY, findCartoStructure)
            provide(CREATE_STRUCTURE_FROM_DATA_KEY, createStructureFromData)
            provide(CREATE_STRUCTURE_FROM_CARTO_KEY, createStructureFromCarto)
            provide(CREATE_MEDIATEUR_EN_ACTIVITE_KEY, createMediateurEnActivite)

            return ajouterLieuxActivite({
              userId,
              mediateurId: mediateur.id,
              lieuxActivite,
            })
          }),
        )
      },
    ),
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
