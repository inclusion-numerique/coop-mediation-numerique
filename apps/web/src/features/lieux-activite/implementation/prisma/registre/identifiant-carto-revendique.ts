import type { Prisma } from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'
import { identifiantCarto } from './inscription-correlee'

export const identifiantCartoRevendique = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
  inscriptionId: number | null,
): Promise<string | null> => {
  const identifiant = identifiantCarto(lieu)

  if (identifiant == null) return null

  const porteur = await transaction.lieuInclusionRegistreMain.findUnique({
    where: { structureCartographieNationaleId: identifiant },
    select: { id: true },
  })

  return porteur == null || porteur.id === inscriptionId ? identifiant : null
}
