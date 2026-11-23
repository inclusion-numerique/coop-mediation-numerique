import type { InscriptionEtat } from './etat-de-l-inscription'
import type { UserId } from './utilisateur-id'

export type GetInscriptionEtat = (
  userId: UserId,
) => Promise<InscriptionEtat | null>
