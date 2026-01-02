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
 * Rules for finding the current emploi for a user and a date, handling edge cases :
 * - if there is only one emploi for the user, it is always valid (no date bounds)
 * - if there are multiple emplois for the user:
 *   - The first emploi (earliest creation) is valid for all past dates
 *   - Each emploi is valid from its debut date until the day before the next emploi's debut
 *   - The last emploi (latest debut) is valid for all future dates
 *
 * - on strict mode, if no emploi is found for the date, null is returned
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
    : await prismaClient.employeStructure.findMany({
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
        orderBy: { debut: 'asc' },
      })

  if (strictDateBounds) {
    const emploi = emplois[0]
    if (!emploi) {
      return null as T extends true ? null : ActeurEmploi
    }
    return emploi
  }

  // non strict mode
  const firstEmploi = emplois.at(0)
  if (!firstEmploi) {
    throw new Error('No emploi found for user and date')
  }

  // if only one emploi, return it
  if (firstEmploi && emplois.length === 1) {
    return firstEmploi
  }

  const lastEmploi = emplois.at(-1)
  if (!lastEmploi) {
    // will not happen, here for type safety
    throw new Error('No emploi found for user and date')
  }

  // if there is a current emploi, return it
  const currentEmploiForDate = emplois.reverse().find((emploi) => {
    return (emploi.fin === null || emploi.fin > date) && emploi.debut <= date
  })
  if (currentEmploiForDate) {
    return currentEmploiForDate
  }

  // no emploi for the given date, if the date is before the first emploi, return the first emploi
  if (date <= firstEmploi.debut) {
    return firstEmploi
  }

  // else, the date is after the last emploi, return the last emploi
  return lastEmploi
}
