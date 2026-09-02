import { searchLieuxActivite } from '@app/web/features/lieux-activite/searchLieuxActivite'
import { CreerLieuActiviteValidation } from '@app/web/features/structures/CreerLieuActiviteValidation'
import {
  setDescriptionFields,
  setInformationsGeneralesFields,
  setInformationsPratiquesFields,
  setModalitesAccesAuServiceFields,
  setServicesEtAccompagnementFields,
  setTypesDePublicsAccueillisFields,
  setVisiblePourCartographieNationaleFields,
} from '@app/web/features/structures/lieuInclusionDepuisSaisie'
import { prismaClient } from '@app/web/prismaClient'
import { sendRemovedFromLieuEmail } from '@app/web/server/email/sendRemovedFromLieuEmail'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { v4 } from 'uuid'
import z from 'zod'

export const lieuActiviteRouter = router({
  create: protectedProcedure
    .input(CreerLieuActiviteValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      if (!user.mediateur) {
        throw forbiddenError("Cet utilisateur n'est pas un médiateur")
      }

      return prismaClient.lieuInclusion.create({
        data: {
          id: v4(),
          ...setInformationsGeneralesFields(input),
          ...setVisiblePourCartographieNationaleFields(input),
          ...setInformationsPratiquesFields(input),
          ...setDescriptionFields(input),
          ...setServicesEtAccompagnementFields(input),
          ...setModalitesAccesAuServiceFields(input),
          ...setTypesDePublicsAccueillisFields(input),
          creationParId: user.id,
          mediateursEnActivite: {
            create: {
              id: v4(),
              mediateurId: user.mediateur.id,
              debut: new Date(),
              creationParId: user.id,
            },
          },
        },
      })
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query }, ctx: { user: sessionUser } }) => {
      enforceIsMediateur(sessionUser)

      return searchLieuxActivite({
        mediateurId: sessionUser.mediateur.id,
        searchParams: { recherche: query },
      })
    }),
  removeMediateurFromLieu: protectedProcedure
    .input(
      z.object({
        mediateurId: z.string().uuid(),
        structureId: z.string().uuid(),
      }),
    )
    .mutation(
      async ({ input: { mediateurId, structureId }, ctx: { user } }) => {
        const userIsDeletingItsOwnLieuActivite =
          user.mediateur?.id === mediateurId

        // Check permissions: admin, support, or coordinateur
        if (
          !userIsDeletingItsOwnLieuActivite &&
          user.role !== 'Admin' &&
          user.role !== 'Support' &&
          !user.coordinateur
        ) {
          throw forbiddenError(
            "Vous n'avez pas les droits pour retirer un médiateur d'un lieu",
          )
        }

        const stopwatch = createStopwatch()

        // Find the active MediateurEnActivite record with related data
        const mediateurEnActivite =
          await prismaClient.mediateurEnActivite.findFirst({
            where: {
              mediateurId,
              structureId,
              fin: null,
              suppression: null,
            },
            include: {
              mediateur: {
                include: {
                  user: {
                    select: {
                      email: true,
                      firstName: true,
                      lastName: true,
                      name: true,
                    },
                  },
                },
              },
              lieuInclusion: {
                select: {
                  nom: true,
                },
              },
            },
          })

        if (!mediateurEnActivite) {
          throw invalidError(
            "Ce médiateur n'est pas actuellement en activité sur ce lieu",
          )
        }

        // only send email if not userIsDeletingItsOwnLieuActivite
        if (!userIsDeletingItsOwnLieuActivite) {
          // Get the display name of the user who is removing the mediateur
          const removedByName = user?.name
            ? user.name
            : user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email

          // Send email BEFORE database update (if email fails, no deletion happens)
          await sendRemovedFromLieuEmail({
            mediateurEmail: mediateurEnActivite.mediateur.user.email,
            mediateurFirstname: mediateurEnActivite.mediateur.user.firstName,
            structureNom: mediateurEnActivite.lieuInclusion.nom,
            removedByName,
          })
        }
        const timestamp = new Date()

        // Set fin date to mark end of activity (but not suppression)
        await prismaClient.mediateurEnActivite.update({
          where: {
            id: mediateurEnActivite.id,
          },
          data: {
            fin: timestamp,
            modification: timestamp,
            derniereModificationParId: user.id,
          },
        })

        addMutationLog({
          userId: user.id,
          nom: 'SupprimerMediateurEnActivite',
          duration: stopwatch.stop().duration,
          data: {
            mediateurId,
            structureId,
          },
        })
      },
    ),
})
