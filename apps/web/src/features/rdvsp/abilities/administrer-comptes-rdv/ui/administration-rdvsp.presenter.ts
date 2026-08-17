import type { SanteCompteRdv } from '../domain/sante-compte'

/**
 * Traduit l'état d'un compte pour le bandeau de statut, qui n'en connaît que
 * trois. Un compte débranché par son propriétaire n'y apparaît pas en erreur :
 * il n'y a rien à réparer.
 */
export const statutAffiche = (
  sante: SanteCompteRdv,
): 'none' | 'success' | 'error' => {
  if (sante._tag === 'deconnecteParUtilisateur') {
    return 'none'
  }

  return sante._tag === 'enErreur' || sante._tag === 'jamaisLie'
    ? 'error'
    : 'success'
}
