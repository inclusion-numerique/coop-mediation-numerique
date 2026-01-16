import { prismaClient } from '@app/web/prismaClient'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import type { Prisma } from '@prisma/client'

const emploiStructureEmployeuseSelect = {
  id: true,
  nom: true,
  adresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  complementAdresse: true,
  siret: true,
  rna: true,
  typologies: true,
  nomReferent: true,
  courrielReferent: true,
  telephoneReferent: true,
} satisfies Prisma.StructureSelect

export type EmploiStructureEmployeuse = Prisma.StructureGetPayload<{
  select: typeof emploiStructureEmployeuseSelect
}>

const emploiContractSelect = {
  id: true,
  userId: true,
  debut: true,
  fin: true,
  creation: true,
} satisfies Prisma.EmployeStructureSelect

export type EmploiContract = Prisma.EmployeStructureGetPayload<{
  select: typeof emploiContractSelect
}>

export type ActeurEmploi = EmploiContract & {
  structure: EmploiStructureEmployeuse
}

/**
 * Rules for finding the current emploi for a user and a date.
 *
 * Non-strict mode (handles gaps gracefully, each emploi is valid until the next one starts):
 * - If date <= first emploi debut, return first emploi
 * - Iterate through emplois ordered by debut ASC:
 *   - If date < next emploi debut, return current emploi
 *   - If no next emploi (last one), return it
 *
 * Strict mode:
 * - Only returns an emploi if the date falls within its debut/fin bounds
 * - Returns null if no emploi matches the date
 */
// add typescript overrides: if strict is true, the return type is EmploiData, otherwise it is EmploiData | null
export const getActeurEmploiForDate = async <T extends boolean>({
  userId,
  date,
  strictDateBounds,
}: {
  userId: string
  date: Date
  strictDateBounds: T
}): Promise<T extends true ? ActeurEmploi | null : ActeurEmploi> => {
  const emplois = strictDateBounds
    ? [
        await prismaClient.employeStructure.findFirst({
          where: {
            userId,
            suppression: null,
            OR: [
              {
                debut: { lte: date },
                fin: null,
              },
              {
                debut: { lte: date },
                fin: { gte: date },
              },
            ],
          },
          select: {
            ...emploiContractSelect,
            structure: {
              select: emploiStructureEmployeuseSelect,
            },
          },
          orderBy: { debut: 'desc' },
        }),
      ].filter(isDefinedAndNotNull)
    : // In non-strict mode, fetch ALL emplois for the user (without date filtering)
      // The date logic is applied in code below to handle edge cases like:
      // - dates before the first emploi's debut
      // - dates after the last emploi's fin
      await prismaClient.employeStructure.findMany({
        where: {
          userId,
          suppression: null,
        },
        select: {
          ...emploiContractSelect,
          structure: {
            select: emploiStructureEmployeuseSelect,
          },
        },
        orderBy: { debut: 'asc' },
      })

  if (strictDateBounds) {
    const emploi = emplois[0]
    if (!emploi) {
      return null as T extends true ? null : ActeurEmploi
    }
    return emploi
  }

  // Non-strict mode: find the emploi valid for the given date
  // Emplois are ordered by debut ASC
  const firstEmploi = emplois.at(0)
  if (!firstEmploi) {
    throw new Error('No emploi found for user')
  }

  // If date <= first emploi debut, return first emploi
  if (date <= firstEmploi.debut) {
    return firstEmploi
  }

  // Iterate through emplois: each emploi is valid until the next one starts
  for (let i = 0; i < emplois.length; i++) {
    const currentEmploi = emplois[i]
    const nextEmploi = emplois[i + 1]

    // If no next emploi (last one), return current
    if (!nextEmploi) {
      return currentEmploi
    }

    // If date < next emploi debut, current emploi is still valid
    if (date < nextEmploi.debut) {
      return currentEmploi
    }
  }

  // Fallback (should not be reached due to loop logic)
  return firstEmploi
}
