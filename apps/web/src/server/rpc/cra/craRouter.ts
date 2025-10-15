import { CraAnimationValidation } from '@app/web/features/activites/use-cases/cra/animation/validation/CraAnimationValidation'
import { CraCollectifServerValidation } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifServerValidation'
import {
  createOrUpdateActivite,
  getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite,
} from '@app/web/features/activites/use-cases/cra/db/createOrUpdateActivite'
import { createOrUpdateActiviteCoordination } from '@app/web/features/activites/use-cases/cra/db/createOrUpdateActiviteCoordination'
import { CraEvenementValidation } from '@app/web/features/activites/use-cases/cra/evenement/validation/CraEvenementValidation'
import { CraIndividuelServerValidation } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelServerValidation'
import { CraPartenariatValidation } from '@app/web/features/activites/use-cases/cra/partenariat/validation/CraPartenariatValidation'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsCoordinateur } from '@app/web/server/rpc/enforceIsCoordinateur'
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

      return createOrUpdateActivite({
        input: {
          type: 'Individuel',
          data: input,
        },
        userId: user.id,
        mediateurId: user.mediateur.id,
      })
    }),
  collectif: protectedProcedure
    .input(CraCollectifServerValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      return createOrUpdateActivite({
        input: {
          type: 'Collectif',
          data: input,
        },
        userId: user.id,
        mediateurId: user.mediateur.id,
      })
    }),
  animation: protectedProcedure
    .input(CraAnimationValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      return createOrUpdateActiviteCoordination({
        input: {
          type: 'Animation',
          data: input,
        },
        userId: user.id,
        coordinateurId: user.coordinateur.id,
      })
    }),
  evenement: protectedProcedure
    .input(CraEvenementValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      return createOrUpdateActiviteCoordination({
        input: {
          type: 'Evenement',
          data: input,
        },
        userId: user.id,
        coordinateurId: user.coordinateur.id,
      })
    }),
  partenariat: protectedProcedure
    .input(CraPartenariatValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsCoordinateur(user)

      return createOrUpdateActiviteCoordination({
        input: {
          type: 'Partenariat',
          data: input,
        },
        userId: user.id,
        coordinateurId: user.coordinateur.id,
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
        select: {
          id: true,
          premierAccompagnement: true,
          beneficiaireId: true,
        },
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

      // we need to decrement the accompagnements_count for the beneficiaires that will not be deleted
      const beneficiairesIdsForAccompagnementCountDecrement = accompagnements
        .map((a) => a.beneficiaireId)
        .filter(
          (beneficiaireId) =>
            !beneficiairesAnonymesIdsToDelete.includes(beneficiaireId),
        )

      // TODO: update beneficiaires non anonymous from accompagnement, decrement accompagnements_count
      // TODO: update mediateur from mediateur_id, decrement activites_count and accompagnements_count

      const now = new Date()

      await prismaClient.$transaction(
        [
          // Delete associated tags
          prismaClient.activitesTags.deleteMany({
            where: {
              activiteId,
            },
          }),
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
          prismaClient.activite.update({
            where: { id: activiteId },
            data: { suppression: now, modification: now, rdvId: null },
          }),
          // Remove activite's lieu activite count
          activite.structureId
            ? prismaClient.structure.update({
                where: { id: activite.structureId },
                data: { activitesCount: { decrement: 1 } },
              })
            : null,
          // Remove from mediateur's activites count
          prismaClient.mediateur.update({
            where: { id: activite.mediateurId },
            data: {
              activitesCount: { decrement: 1 },
              accompagnementsCount: {
                decrement: accompagnements.length,
              },
            },
          }),
          // Decrement the accompagnements_count for the beneficiaires that will not be deleted
          beneficiairesIdsForAccompagnementCountDecrement.length > 0
            ? prismaClient.beneficiaire.updateMany({
                where: {
                  id: { in: beneficiairesIdsForAccompagnementCountDecrement },
                },
                data: { accompagnementsCount: { decrement: 1 } },
              })
            : null,
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
