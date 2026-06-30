import type { InscriptionEtat } from './inscription-etat'
import type { UserId } from './user-id'

export type GetInscriptionEtat = (
  userId: UserId,
) => Promise<InscriptionEtat | null>
