import type { Result } from '@app/web/libraries/result'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'

export type ErreurAffichageRdvs = { readonly _tag: 'CompteRdvIntrouvable' }

export const CompteRdvIntrouvable = (): ErreurAffichageRdvs => ({
  _tag: 'CompteRdvIntrouvable',
})

/**
 * Préférence d'affichage : les rendez-vous RDV Service Public apparaissent-ils
 * dans la liste des activités.
 *
 * Elle est portée par le compte RDV et non par l'utilisateur, ce qui la rend
 * indisponible tant qu'aucun compte n'est connecté — d'où l'échec explicite
 * plutôt qu'un silence.
 */
export type AfficherRdvsDansActivites = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly afficher: boolean
}) => Promise<Result<void, ErreurAffichageRdvs>>
