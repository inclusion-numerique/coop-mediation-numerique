import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsCoordinateur } from '@app/web/server/rpc/enforceIsCoordinateur'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { TagScope, TagValidation } from './list/TagValidation'

export const tagsRouter = router({
  create: protectedProcedure
    .input(TagValidation)
    .mutation(
      async ({
        input: { nom, description, scope },
        ctx: { user: sessionUser },
      }) => {
        if (scope === TagScope.Personnel || !isCoordinateur(sessionUser)) {
          enforceIsMediateur(sessionUser)

          await prismaClient.tag.create({
            data: {
              nom,
              description,
              mediateurId: sessionUser.mediateur.id,
            },
          })
        }

        if (scope === TagScope.Departemental || !isMediateur(sessionUser)) {
          enforceIsCoordinateur(sessionUser)

          await prismaClient.tag.create({
            data: {
              nom,
              description,
              departement: getUserDepartement(sessionUser).code,
            },
          })
        }
      },
    ),
})
