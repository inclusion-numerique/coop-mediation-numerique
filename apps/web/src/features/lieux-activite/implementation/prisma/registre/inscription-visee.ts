import type { Prisma } from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'
import { inscriptionCorrelee } from './inscription-correlee'

export type InscriptionVisee =
  | { readonly _tag: 'DejaInscrite'; readonly id: number }
  | { readonly _tag: 'AAdopter'; readonly id: number }
  | { readonly _tag: 'Absente' }

export const inscriptionVisee = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<InscriptionVisee> => {
  const sousLeLienCoop = await transaction.lieuInclusionRegistreMain.findUnique(
    {
      where: { structureCoopId: lieu.id },
      select: { id: true },
    },
  )

  if (sousLeLienCoop != null)
    return { _tag: 'DejaInscrite', id: sousLeLienCoop.id }

  const correlee = await inscriptionCorrelee(transaction, lieu)

  return correlee == null
    ? { _tag: 'Absente' }
    : { _tag: 'AAdopter', id: correlee }
}
