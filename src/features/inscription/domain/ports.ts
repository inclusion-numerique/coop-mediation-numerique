import type { InscriptionEtat } from './etat-de-l-inscription'
import type { UtilisateurId } from './utilisateur-id'

export type LireLEtatDeLInscription = (
  userId: UtilisateurId,
) => Promise<InscriptionEtat | null>
