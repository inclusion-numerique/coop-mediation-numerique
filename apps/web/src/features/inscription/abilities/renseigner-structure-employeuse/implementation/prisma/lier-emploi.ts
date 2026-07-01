import type { LierEmploi } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/domain'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

/**
 * Rompt l'emploi précédent (autre structure encore active), crée le nouvel
 * emploi et marque l'étape `structureEmployeuseRenseignee` franchie — le tout en
 * transaction, scopé sur l'utilisateur courant.
 */
export const lierEmploi: LierEmploi = async ({ userId, structureId }) => {
  const now = new Date()

  await prismaClient.$transaction(async (transaction) => {
    await transaction.employeStructure.updateMany({
      where: {
        userId,
        structure: { id: { not: structureId } },
        suppression: null,
        fin: null,
      },
      data: { fin: now, suppression: now },
    })

    await transaction.user.update({
      where: { id: userId },
      data: {
        structureEmployeuseRenseignee: now,
        emplois: { create: { id: v4(), structureId, debut: now } },
      },
    })
  })
}
