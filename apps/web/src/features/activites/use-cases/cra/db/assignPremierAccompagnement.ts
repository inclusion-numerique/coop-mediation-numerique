import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

type AccompagnementInfo = {
  accompagnement_id: string
  beneficiaire_id: string
}

/**
 * Given the current and earliest accompagnement for a beneficiaire,
 * returns which IDs need to be updated (if any)
 */
const computePremierChanges = (
  current: AccompagnementInfo | undefined,
  earliest: AccompagnementInfo | undefined,
): { toRemove: string | null; toAdd: string | null } => {
  // No earliest = no accompagnements left, just remove current if exists
  if (!earliest) {
    return { toRemove: current?.accompagnement_id ?? null, toAdd: null }
  }

  // Already correct
  if (current?.accompagnement_id === earliest.accompagnement_id) {
    return { toRemove: null, toAdd: null }
  }

  // Need to change: remove old (if exists), add new
  return {
    toRemove: current?.accompagnement_id ?? null,
    toAdd: earliest.accompagnement_id,
  }
}

/**
 * We store the premier accompagnement flag in an Accompagnement model,
 * for each Beneficiaire (useful notably for beneficiaires suivis).
 *
 * This can get broken by deletion / update of activities or accompagnements.
 *
 * This function will assign the premier accompagnement flag to the correct accompagnements, based on the Date of the Activite
 * linked to the Acompagnement.
 */
export const assignPremierAccompagnement = async ({
  beneficiaireIds,
  transactionClient,
}: {
  beneficiaireIds: string[]
  transactionClient?: Prisma.TransactionClient
}) => {
  if (beneficiaireIds.length === 0) {
    return { removed: 0, added: 0 }
  }

  const dbClient = transactionClient ?? prismaClient

  // Fetch current premiers and earliest accompagnements in parallel
  const [currentPremiers, earliestAccompagnements] = await Promise.all([
    // Current accompagnements with premier_accompagnement=true
    dbClient.$queryRaw<AccompagnementInfo[]>`
      SELECT a.id AS accompagnement_id, a.beneficiaire_id
      FROM accompagnements a
      WHERE a.beneficiaire_id = ANY(${beneficiaireIds}::uuid[])
        AND a.premier_accompagnement = true
    `,
    // Earliest accompagnement per beneficiaire (by activite.date)
    dbClient.$queryRaw<AccompagnementInfo[]>`
      SELECT DISTINCT ON (a.beneficiaire_id)
        a.id AS accompagnement_id,
        a.beneficiaire_id
      FROM accompagnements a
      INNER JOIN activites act ON act.id = a.activite_id
      WHERE a.beneficiaire_id = ANY(${beneficiaireIds}::uuid[])
        AND act.suppression IS NULL
      ORDER BY a.beneficiaire_id, act.date ASC, act.id ASC
    `,
  ])

  // Index by beneficiaire_id for fast lookup
  const currentByBeneficiaire = new Map(
    currentPremiers.map((row) => [row.beneficiaire_id, row]),
  )
  const earliestByBeneficiaire = new Map(
    earliestAccompagnements.map((row) => [row.beneficiaire_id, row]),
  )

  // Compute changes in memory
  const idsToRemove: string[] = []
  const idsToAdd: string[] = []

  for (const beneficiaireId of beneficiaireIds) {
    const { toRemove, toAdd } = computePremierChanges(
      currentByBeneficiaire.get(beneficiaireId),
      earliestByBeneficiaire.get(beneficiaireId),
    )
    if (toRemove) idsToRemove.push(toRemove)
    if (toAdd) idsToAdd.push(toAdd)
  }

  // Execute updates in parallel
  const updates: Promise<number>[] = []

  if (idsToRemove.length > 0) {
    updates.push(
      dbClient.$executeRaw`
        UPDATE accompagnements
        SET premier_accompagnement = false
        WHERE id = ANY(${idsToRemove}::uuid[])
      `,
    )
  }

  if (idsToAdd.length > 0) {
    updates.push(
      dbClient.$executeRaw`
        UPDATE accompagnements
        SET premier_accompagnement = true
        WHERE id = ANY(${idsToAdd}::uuid[])
      `,
    )
  }

  await Promise.all(updates)

  return { removed: idsToRemove.length, added: idsToAdd.length }
}
