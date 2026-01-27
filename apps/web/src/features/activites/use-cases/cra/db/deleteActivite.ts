import { prismaClient } from '@app/web/prismaClient'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { assignPremierAccompagnement } from './assignPremierAccompagnement'

/**
 * Pre-compute operations needed for deleting an activité.
 * This runs BEFORE the transaction to avoid complex subqueries inside the transaction.
 *
 * Returns:
 * - beneficiaireIdsToDelete: anonymous beneficiaires that only have accompagnements for this activité
 * - beneficiaireSuivisIds: non-anonymous beneficiaires (for premierAccompagnement reassignment)
 * - accompagnementCount: total accompagnements for this activité
 */
const precomputeDeleteOperations = async (activiteId: string) => {
  const result = await prismaClient.$queryRaw<
    {
      beneficiaire_ids_to_delete: string[] | null
      beneficiaire_suivis_ids: string[] | null
      accompagnement_count: number
    }[]
  >`
    WITH 
    -- Get all accompagnements for this activité with beneficiaire info
    current_accompagnements AS (
      SELECT 
        a.beneficiaire_id,
        b.anonyme
      FROM accompagnements a
      INNER JOIN beneficiaires b ON b.id = a.beneficiaire_id
      WHERE a.activite_id = ${activiteId}::uuid
    ),
    -- Count other accompagnements per beneficiaire (excluding this activité)
    beneficiaire_other_accompagnements AS (
      SELECT 
        ca.beneficiaire_id,
        ca.anonyme,
        COUNT(other.id) AS other_count
      FROM current_accompagnements ca
      LEFT JOIN accompagnements other 
        ON other.beneficiaire_id = ca.beneficiaire_id 
        AND other.activite_id <> ${activiteId}::uuid
      GROUP BY ca.beneficiaire_id, ca.anonyme
    ),
    -- Beneficiaires to delete: anonymous with no other accompagnements
    to_delete AS (
      SELECT beneficiaire_id 
      FROM beneficiaire_other_accompagnements 
      WHERE anonyme = true AND other_count = 0
    ),
    -- Beneficiaires suivis: non-anonymous (need premierAccompagnement check)
    suivis AS (
      SELECT DISTINCT beneficiaire_id 
      FROM current_accompagnements 
      WHERE anonyme = false
    )
    SELECT 
      ARRAY(SELECT beneficiaire_id FROM to_delete) AS beneficiaire_ids_to_delete,
      ARRAY(SELECT beneficiaire_id FROM suivis) AS beneficiaire_suivis_ids,
      (SELECT COUNT(*)::int FROM current_accompagnements) AS accompagnement_count
  `

  const row = result[0]
  return {
    beneficiaireIdsToDelete: row?.beneficiaire_ids_to_delete ?? [],
    beneficiaireSuivisIds: row?.beneficiaire_suivis_ids ?? [],
    accompagnementCount: row?.accompagnement_count ?? 0,
  }
}

/**
 * Optimized delete using raw SQL for bulk operations.
 *
 * Performance improvements:
 * 1. Pre-compute decisions BEFORE the transaction (no complex subqueries in transaction)
 * 2. Transaction contains only simple targeted operations
 * 3. Uses ANY($1::uuid[]) for efficient array operations
 */
export const deleteActivite = async ({
  activiteId,
  sessionUserId,
  mediateurId,
}: {
  activiteId: string
  mediateurId: string
  sessionUserId: string
}) => {
  const stopwatch = createStopwatch()

  // Step 1: Fetch activite and pre-compute operations in parallel
  const [activite, operations] = await Promise.all([
    prismaClient.activite.findUnique({
      where: { id: activiteId, suppression: null },
      select: { id: true, type: true, mediateurId: true, structureId: true },
    }),
    precomputeDeleteOperations(activiteId),
  ])

  if (!activite) {
    throw invalidError('Activité not found')
  }

  if (activite.mediateurId !== mediateurId) {
    throw forbiddenError('Cannot delete activité for another mediateur')
  }

  const {
    beneficiaireIdsToDelete,
    beneficiaireSuivisIds,
    accompagnementCount,
  } = operations

  const now = new Date()

  // Step 2: Execute all operations in a single transaction
  await prismaClient.$transaction(async (tx) => {
    // Delete accompagnements
    await tx.$executeRaw`
      DELETE FROM accompagnements
      WHERE activite_id = ${activiteId}::uuid
    `

    // Delete activite tags
    await tx.$executeRaw`
      DELETE FROM activite_tags
      WHERE activite_id = ${activiteId}::uuid
    `

    // Delete anonymous beneficiaires
    if (beneficiaireIdsToDelete.length > 0) {
      await tx.$executeRaw`
        DELETE FROM beneficiaires
        WHERE id = ANY(${beneficiaireIdsToDelete}::uuid[])
      `
    }

    // Decrement accompagnements_count for beneficiaires suivis
    if (beneficiaireSuivisIds.length > 0) {
      await tx.$executeRaw`
        UPDATE beneficiaires
        SET accompagnements_count = accompagnements_count - 1
        WHERE id = ANY(${beneficiaireSuivisIds}::uuid[])
      `
    }

    // Soft-delete the activité
    await tx.$executeRaw`
      UPDATE activites
      SET suppression = ${now}, modification = ${now}, rdv_id = NULL
      WHERE id = ${activiteId}::uuid
    `

    // Decrement mediateur counts
    await tx.$executeRaw`
      UPDATE mediateurs
      SET activites_count = activites_count - 1,
          accompagnements_count = accompagnements_count - ${accompagnementCount}
      WHERE id = ${mediateurId}::uuid
    `

    // Decrement structure count if applicable
    if (activite.structureId) {
      await tx.$executeRaw`
        UPDATE structures
        SET activites_count = activites_count - 1
        WHERE id = ${activite.structureId}::uuid
      `
    }

    // Reassign premierAccompagnement for beneficiaires suivis
    if (beneficiaireSuivisIds.length > 0) {
      await assignPremierAccompagnement({
        beneficiaireIds: beneficiaireSuivisIds,
        transactionClient: tx,
      })
    }
  })

  addMutationLog({
    userId: sessionUserId,
    nom: 'SupprimerActivite',
    duration: stopwatch.stop().duration,
    data: {
      type: activite.type,
      id: activiteId,
    },
  })

  return true
}
