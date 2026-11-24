import type { Prisma } from '@/generated/prisma/client'
import { retraitCoop } from '../../../domain/registre/signature-coop'

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
