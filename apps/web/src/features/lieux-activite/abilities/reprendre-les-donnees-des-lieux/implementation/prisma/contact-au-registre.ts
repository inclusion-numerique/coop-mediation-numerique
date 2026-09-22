import {
  inscriptionPourLIdentifiantCarto,
  lieuCoopToDomain,
  lieuVersRegistre,
} from '@app/web/features/lieux-activite/implementation'
import type { Prisma } from '@prisma/client'

export const ecrireLeContactAuRegistre = async (
  transaction: Prisma.TransactionClient,
  lieuId: string,
): Promise<void> => {
  const ligne = await transaction.lieuInclusion.findUnique({
    where: { id: lieuId },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  if (ligne == null) return

  await transaction.lieuInclusionRegistreMain.updateMany({
    where: { structureCoopId: lieuId },
    data: { contact: lieuVersRegistre(lieuCoopToDomain(ligne)).contact },
  })
}
