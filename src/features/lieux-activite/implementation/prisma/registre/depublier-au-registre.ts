import type { Prisma } from '@app/web/generated/prisma/client'
import { depublicationCoop } from './signature-coop'

export const depublierAuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    lieuId,
    maintenant,
  }: { readonly lieuId: string; readonly maintenant: Date },
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.updateMany({
    where: { structureCoopId: lieuId },
    data: depublicationCoop(maintenant),
  })
}
