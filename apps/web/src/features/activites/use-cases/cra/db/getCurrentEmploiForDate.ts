import { prismaClient } from '@app/web/prismaClient'

/**
 * Rules for finding the current emploi for a mediateur and a date, handling edge cases :
 * - if there is only one emploi for the mediateur, it is always valid (no date bounds)
 * - if there are multiple emplois for the mediateur:
 *   - The first emploi (earliest creation) is valid for all past dates
 *   - Each emploi is valid from its creation date until the day before the next emploi's creation
 *   - The last emploi (latest creation) is valid for all future dates
 */
export const getCurrentEmploiForDate = async ({
  mediateurId,
  date,
}: {
  mediateurId: string
  date: Date
}) => {
  const emplois = await prismaClient.employeStructure.findMany({
    where: {
      user: {
        mediateur: { id: mediateurId },
      },
    },
    orderBy: { creation: 'asc' },
  })

  if (emplois.length === 1) {
    return emplois[0]
  }
  for (const emploi of emplois) {
    if (!emploi.suppression) {
      return emploi
    }
    if (date < emploi.suppression) {
      return emploi
    }
  }

  throw new Error('No emploi found for date')
}
