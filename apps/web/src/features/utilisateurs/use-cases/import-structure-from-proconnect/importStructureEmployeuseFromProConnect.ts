import { importStructureEmployeuseFromSiret } from '@app/web/features/structures/importStructureEmployeuseFromSiret'
import { prismaClient } from '@app/web/prismaClient'

export type ImportStructureEmployeuseFromProConnectResult = {
  success: boolean
  noOp: boolean
  reason?: string
  structureId?: string
}

export const importStructureEmployeuseFromProConnect = async ({
  userId,
  siret,
}: {
  userId: string
  siret: string | null | undefined
}): Promise<ImportStructureEmployeuseFromProConnectResult> => {
  // ProConnect may not provide a SIRET; in that case we intentionally do nothing.
  if (!siret) {
    return {
      success: true,
      noOp: true,
      reason: 'No SIRET provided by ProConnect',
    }
  }

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { isConseillerNumerique: true },
  })

  if (!user) {
    return {
      success: false,
      noOp: true,
      reason: 'User not found',
    }
  }

  // This import logic only applies to non-conseiller users.
  if (user.isConseillerNumerique) {
    return {
      success: true,
      noOp: true,
      reason: 'User is conseiller numerique',
    }
  }

  // We use explicit day boundaries to keep "today/yesterday" behavior deterministic.
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  const yesterdayEnd = new Date(todayStart.getTime() - 1)

  // Fetch active emplois with structure SIRET so we can apply transition rules.
  const emplois = await prismaClient.employeStructure.findMany({
    where: {
      userId,
      suppression: null,
    },
    select: {
      id: true,
      debut: true,
      fin: true,
      structure: {
        select: {
          siret: true,
        },
      },
    },
  })

  // If the user already has a running emploi on the same SIRET, avoid creating duplicates.
  const hasRunningEmploiForSameSiret = emplois.some((emploi) => {
    const isRunning = emploi.fin === null || emploi.fin > now
    return isRunning && emploi.structure.siret === siret
  })

  if (hasRunningEmploiForSameSiret) {
    return {
      success: true,
      noOp: true,
      reason: 'User already has a running emploi for this SIRET',
    }
  }

  // Build two mutation lists:
  // - temporary emplois (debut=null) on another SIRET => soft-delete
  // - running emplois on another SIRET => end yesterday
  const emploiIdsToSoftDelete: string[] = []
  const emploiIdsToEndYesterday: string[] = []

  for (const emploi of emplois) {
    const isDifferentSiret = emploi.structure.siret !== siret
    const isEnded = emploi.fin !== null && emploi.fin <= now
    const isRunning = emploi.fin === null || emploi.fin > now

    // Ended emplois are historical data; we keep them untouched.
    if (isEnded) {
      continue
    }

    // Temporary emplois from another structure must be closed before creating the ProConnect one.
    if (emploi.debut === null && isDifferentSiret) {
      emploiIdsToSoftDelete.push(emploi.id)
      continue
    }

    // Running emplois from another structure are closed "yesterday" to avoid overlap with today's start.
    if (isRunning && isDifferentSiret) {
      emploiIdsToEndYesterday.push(emploi.id)
    }
  }

  // Apply all emploi transitions atomically to avoid partial state if one query fails.
  if (emploiIdsToSoftDelete.length > 0 || emploiIdsToEndYesterday.length > 0) {
    await prismaClient.$transaction(async (transaction) => {
      if (emploiIdsToSoftDelete.length > 0) {
        await transaction.employeStructure.updateMany({
          where: { id: { in: emploiIdsToSoftDelete } },
          data: {
            suppression: now,
            fin: now,
          },
        })
      }

      if (emploiIdsToEndYesterday.length > 0) {
        await transaction.employeStructure.updateMany({
          where: { id: { in: emploiIdsToEndYesterday } },
          data: {
            fin: yesterdayEnd,
          },
        })
      }
    })
  }

  // Resolve/create the structure from SIRET and create an emploi when possible.
  const result = await importStructureEmployeuseFromSiret({
    userId,
    siret,
  })

  // If SIRET import fails (invalid/closed/API error), we expose a functional failure.
  if (!result) {
    return {
      success: false,
      noOp: false,
      reason:
        'Failed to import structure from SIRET (API error or invalid SIRET)',
    }
  }

  // Safety net: ensure there is at least one active emploi starting today for this structure.
  // The importer may skip creation when it finds any active emploi on this structure.
  const hasCurrentProConnectEmploi =
    await prismaClient.employeStructure.findFirst({
      where: {
        userId,
        structureId: result.structureId,
        suppression: null,
        debut: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      select: {
        id: true,
      },
    })

  // Create today's emploi only when it was not created/found by the importer.
  if (!hasCurrentProConnectEmploi) {
    await prismaClient.employeStructure.create({
      data: {
        userId,
        structureId: result.structureId,
        debut: new Date(),
      },
    })
  }

  return {
    success: true,
    noOp: false,
    structureId: result.structureId,
  }
}
