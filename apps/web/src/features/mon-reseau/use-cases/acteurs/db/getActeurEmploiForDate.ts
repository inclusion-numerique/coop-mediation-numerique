import { prismaClient } from '@app/web/prismaClient'
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

const hasDebutDate = (
  emploi: ActeurEmploi,
): emploi is ActeurEmploi & { debut: Date } => emploi.debut !== null

/**
 * Get the temporary emploi for a date.
 *
 * A temporary emploi is an emploi without a debut date.
 * It is valid from the next day after the latest ended real emploi.
 */
const getTemporaryEmploiForDate = ({
  emploisWithNullDebut,
  emploisWithDebut,
  date,
}: {
  emploisWithNullDebut: ActeurEmploi[]
  emploisWithDebut: (ActeurEmploi & { debut: Date })[]
  date: Date
}): ActeurEmploi | null => {
  const temporaryEmploi = emploisWithNullDebut.toSorted(
    (a, b) => b.creation.getTime() - a.creation.getTime(),
  )[0]
  if (!temporaryEmploi) {
    return null
  }

  if (emploisWithDebut.length === 0) {
    return temporaryEmploi
  }

  const hasRunningRealEmploi = emploisWithDebut.some(
    (emploi) => emploi.fin === null,
  )
  if (hasRunningRealEmploi) {
    return null
  }

  const latestEndedRealEmploiDate = emploisWithDebut
    .map((emploi) => emploi.fin)
    .filter((fin): fin is Date => fin !== null)
    .toSorted((a, b) => b.getTime() - a.getTime())[0]

  if (!latestEndedRealEmploiDate) {
    return null
  }

  const temporaryEmploiValidFrom = new Date(latestEndedRealEmploiDate)
  temporaryEmploiValidFrom.setHours(0, 0, 0, 0)
  temporaryEmploiValidFrom.setDate(temporaryEmploiValidFrom.getDate() + 1)

  return date >= temporaryEmploiValidFrom ? temporaryEmploi : null
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
  const emplois = await prismaClient.employeStructure.findMany({
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
    orderBy: {
      creation: 'desc',
    },
  })

  const emploisWithDebut = emplois
    .filter(hasDebutDate)
    .toSorted((a, b) => a.debut.getTime() - b.debut.getTime())
  const emploisWithNullDebut = emplois.filter((emploi) => emploi.debut === null)
  const temporaryEmploi = getTemporaryEmploiForDate({
    emploisWithNullDebut,
    emploisWithDebut,
    date,
  })

  if (strictDateBounds) {
    const strictRealEmploi = emploisWithDebut
      .filter(
        (emploi) =>
          emploi.debut <= date && (emploi.fin === null || emploi.fin >= date),
      )
      .toSorted((a, b) => b.debut.getTime() - a.debut.getTime())[0]

    if (strictRealEmploi) {
      return strictRealEmploi
    }

    return (temporaryEmploi ?? null) as T extends true
      ? ActeurEmploi | null
      : ActeurEmploi
  }

  if (temporaryEmploi) {
    return temporaryEmploi
  }

  // Non-strict mode: find the real emploi valid for the given date.
  // Emplois are ordered by debut ASC.
  const firstEmploi = emploisWithDebut.at(0)
  if (!firstEmploi) {
    throw new Error('No emploi found for user')
  }

  // If date <= first emploi debut, return first emploi
  if (date <= firstEmploi.debut) {
    return firstEmploi
  }

  // Iterate through emplois: each emploi is valid until the next one starts
  for (let i = 0; i < emploisWithDebut.length; i++) {
    const currentEmploi = emploisWithDebut[i]
    const nextEmploi = emploisWithDebut[i + 1]

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
