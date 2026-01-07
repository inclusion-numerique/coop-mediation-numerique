import { prismaClient } from '@app/web/prismaClient'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite } from './createOrUpdateActivite'

// Timeout for interactive transactions (15 seconds)
// This is increased from default 5s to handle large ateliers with many beneficiaires
const TRANSACTION_TIMEOUT_MS = 20_000

export const deleteActivite = async ({
  activiteId,
  userId,
  mediateurId,
}: {
  activiteId: string
  userId: string
  mediateurId: string
}) => {
  const stopwatch = createStopwatch()

  const activite = await prismaClient.activite.findUnique({
    where: { id: activiteId, suppression: null },
  })

  if (!activite) {
    throw invalidError('Activité not found')
  }

  if (activite.mediateurId !== mediateurId) {
    throw forbiddenError('Cannot delete activité for another mediateur')
  }

  const accompagnements = await prismaClient.accompagnement.findMany({
    where: { activiteId },
    select: {
      id: true,
      premierAccompagnement: true,
      beneficiaireId: true,
    },
  })

  const beneficiairesAnonymesIdsToDelete =
    await getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite({
      activiteId,
    })

  // Beneficiaires that will NOT be deleted need their accompagnements_count decremented
  const beneficiairesIdsForCountDecrement = accompagnements
    .map((a) => a.beneficiaireId)
    .filter(
      (beneficiaireId) =>
        !beneficiairesAnonymesIdsToDelete.includes(beneficiaireId),
    )

  const now = new Date()

  await prismaClient.$transaction(
    async (transaction) => {
      // Step 1: Handle premierAccompagnement reassignment (must be done before deleting accompagnements)
      const premierAccompagnement = accompagnements.find(
        (a) => a.premierAccompagnement,
      )

      if (premierAccompagnement) {
        const nextAccompagnement = await transaction.accompagnement.findFirst({
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
          await transaction.accompagnement.update({
            where: { id: nextAccompagnement.id },
            data: { premierAccompagnement: true },
          })
        }
      }

      // Step 2: Delete accompagnements and tags in parallel (must be before beneficiaires due to FK)
      await Promise.all([
        transaction.accompagnement.deleteMany({
          where: { activiteId },
        }),
        transaction.activitesTags.deleteMany({
          where: { activiteId },
        }),
      ])

      // Step 3: Delete anonymous beneficiaires (after accompagnements due to FK constraint)
      if (beneficiairesAnonymesIdsToDelete.length > 0) {
        await transaction.beneficiaire.deleteMany({
          where: {
            anonyme: true,
            id: { in: beneficiairesAnonymesIdsToDelete },
          },
        })
      }

      // Step 4: All updates can run in parallel (no FK dependencies between them)
      const updateOperations: Promise<unknown>[] = [
        // Soft-delete the activité
        transaction.activite.update({
          where: { id: activiteId },
          data: { suppression: now, modification: now, rdvId: null },
        }),
        // Decrement mediateur counts
        transaction.mediateur.update({
          where: { id: mediateurId },
          data: {
            activitesCount: { decrement: 1 },
            accompagnementsCount: { decrement: accompagnements.length },
          },
        }),
      ]

      // Decrement structure count if applicable
      if (activite.structureId) {
        updateOperations.push(
          transaction.structure.update({
            where: { id: activite.structureId },
            data: { activitesCount: { decrement: 1 } },
          }),
        )
      }

      // Decrement beneficiaires count for non-deleted beneficiaires
      if (beneficiairesIdsForCountDecrement.length > 0) {
        updateOperations.push(
          transaction.beneficiaire.updateMany({
            where: { id: { in: beneficiairesIdsForCountDecrement } },
            data: { accompagnementsCount: { decrement: 1 } },
          }),
        )
      }

      await Promise.all(updateOperations)
    },
    { timeout: TRANSACTION_TIMEOUT_MS },
  )

  addMutationLog({
    userId,
    nom: 'SupprimerActivite',
    duration: stopwatch.stop().duration,
    data: {
      type: activite.type,
      id: activiteId,
    },
  })

  return true
}
