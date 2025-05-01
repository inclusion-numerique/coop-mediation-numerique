import { CraCollectifServerValidation } from '@app/web/cra/CraCollectifServerValidation'
import { CraDemarcheAdministrativeValidation } from '@app/web/cra/CraDemarcheAdministrativeValidation'
import { CraIndividuelServerValidation } from '@app/web/cra/CraIndividuelServerValidation'
import {
  createOrUpdateActivite,
  getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite,
} from '@app/web/cra/createOrUpdateActivite'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { createStopwatch } from '@app/web/utils/stopwatch'
import z from 'zod'

export const craRouter = router({
  individuel: protectedProcedure
    .input(CraIndividuelServerValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      // Enforce user can create CRA for given mediateurId (for now only self)
      if (input.mediateurId !== user.mediateur.id) {
        throw forbiddenError('Cannot create CRA for another mediateur')
      }

      return createOrUpdateActivite({
        input: {
          type: 'Individuel',
          data: input,
        },
        userId: user.id,
      })
    }),
  demarcheAdministrative: protectedProcedure
    .input(CraDemarcheAdministrativeValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      // Enforce user can create CRA for given mediateurId (for now only self)
      if (input.mediateurId !== user.mediateur.id) {
        throw forbiddenError('Cannot create CRA for another mediateur')
      }

      return createOrUpdateActivite({
        input: {
          type: 'Individuel',
          data: input,
        },
        userId: user.id,
      })
    }),
  collectif: protectedProcedure
    .input(CraCollectifServerValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      // Enforce user can create CRA for given mediateurId (for now only self)
      if (input.mediateurId !== user.mediateur.id) {
        throw forbiddenError('Cannot create CRA for another mediateur')
      }

      return createOrUpdateActivite({
        input: {
          type: 'Collectif',
          data: input,
        },
        userId: user.id,
      })
    }),
  deleteActivite: protectedProcedure
    .input(
      z.object({
        activiteId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input: { activiteId }, ctx: { user } }) => {
      enforceIsMediateur(user)

      const stopwatch = createStopwatch()

      const activite = await prismaClient.activite.findUnique({
        where: { id: activiteId, suppression: null },
      })

      if (!activite) {
        throw invalidError('Cra not found')
      }

      if (activite.mediateurId !== user.mediateur.id) {
        throw forbiddenError('Cannot delete CRA for another mediateur')
      }

      const accompagnements = await prismaClient.accompagnement.findMany({
        where: { activiteId },
        select: { id: true, premierAccompagnement: true, beneficiaireId: true },
      })

      const premierAccompagnement = accompagnements.find(
        (a) => a.premierAccompagnement,
      )

      if (premierAccompagnement) {
        const nextAccompagnement = await prismaClient.accompagnement.findFirst({
          where: {
            beneficiaireId: premierAccompagnement.beneficiaireId,
            id: { not: premierAccompagnement.id },
          },
          orderBy: {
            activite: { date: 'asc' },
          },
          select: { id: true },
        })

        if (nextAccompagnement) {
          await prismaClient.accompagnement.update({
            where: { id: nextAccompagnement.id },
            data: { premierAccompagnement: true },
          })
        }
      }

      const beneficiairesAnonymesIdsToDelete =
        await getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite({
          activiteId,
        })

      await prismaClient.$transaction(
        [
          // Delete accompagnements
          prismaClient.accompagnement.deleteMany({
            where: {
              activiteId,
            },
          }),
          // Delete beneficiaires anonymes liés uniquement à cette activité
          beneficiairesAnonymesIdsToDelete.length > 0
            ? prismaClient.beneficiaire.deleteMany({
                where: {
                  anonyme: true,
                  id: {
                    in: beneficiairesAnonymesIdsToDelete,
                  },
                },
              })
            : null,
          // Delete activité
          prismaClient.activite.delete({
            where: { id: activiteId },
          }),
        ].filter(onlyDefinedAndNotNull),
      )

      addMutationLog({
        userId: user.id,
        nom: 'SupprimerActivite',
        duration: stopwatch.stop().duration,
        data: {
          type: activite.type,
          id: activiteId,
        },
      })

      return true
    }),
})
