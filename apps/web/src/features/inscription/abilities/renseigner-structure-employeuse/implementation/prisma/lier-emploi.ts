import type { LierEmploi } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/domain'
import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

/**
 * Rompt l'emploi précédent (autre structure encore active), crée le nouvel
 * emploi et projette l'état d'inscription — qui porte déjà l'étape franchie — le
 * tout en transaction, scopé sur l'utilisateur courant. Les colonnes
 * d'inscription viennent du transfer, jamais composées à la main ici.
 */
export const lierEmploi: LierEmploi = async ({ etat, structureId }) => {
  const { userId } = etat
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
        ...inscriptionEtatFromDomain(etat),
        emplois: { create: { id: v4(), structureId, debut: now } },
      },
    })
  })
}
