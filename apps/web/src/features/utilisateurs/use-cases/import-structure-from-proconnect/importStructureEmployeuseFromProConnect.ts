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
  if (!siret) {
    return {
      success: true,
      noOp: true,
      reason: 'No SIRET provided by ProConnect',
    }
  }

  const activeEmploisCount = await prismaClient.employeStructure.count({
    where: {
      userId,
      suppression: null,
      fin: null,
    },
  })

  if (activeEmploisCount > 0) {
    return {
      success: true,
      noOp: true,
      reason: `User already has ${activeEmploisCount} active emploi(s)`,
    }
  }

  const result = await importStructureEmployeuseFromSiret({
    userId,
    siret,
  })

  if (!result) {
    return {
      success: false,
      noOp: false,
      reason:
        'Failed to import structure from SIRET (API error or invalid SIRET)',
    }
  }

  return {
    success: true,
    noOp: false,
    structureId: result.structureId,
  }
}
