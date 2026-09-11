import type { Prisma } from '@prisma/client'
import { retraitCoop } from './signature-coop'

export const retirerDuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    lieuId,
    maintenant,
  }: { readonly lieuId: string; readonly maintenant: Date },
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.updateMany({
    where: { structureCoopId: lieuId },
    data: retraitCoop(maintenant),
  })
}
