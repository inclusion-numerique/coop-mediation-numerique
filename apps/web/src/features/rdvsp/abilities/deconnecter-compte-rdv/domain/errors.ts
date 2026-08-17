import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'

/**
 * Le médiateur n'a aucun compte RDV Service Public à délier. Rendu en `Result`
 * plutôt que jeté : c'est un état ordinaire — un utilisateur qui n'a jamais lié
 * de compte — et non une anomalie technique.
 */
export type CompteRdvIntrouvable = {
  readonly _tag: 'CompteRdvIntrouvable'
  readonly utilisateurId: UtilisateurCoopId
}

export const CompteRdvIntrouvable = (
  utilisateurId: UtilisateurCoopId,
): CompteRdvIntrouvable => ({ _tag: 'CompteRdvIntrouvable', utilisateurId })
