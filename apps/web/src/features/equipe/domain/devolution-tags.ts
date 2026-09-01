import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'

/**
 * Le sort des tags d'un médiateur qui quitte ses équipes.
 *
 * Ils reviennent à son coordinateur quand il n'en a qu'un. Aucun, ou plusieurs :
 * personne ne peut hériter sans arbitrer entre eux, et arbitrer n'est pas le
 * rôle d'une suppression de compte — les tags sont alors marqués supprimés.
 * L'historique reste lisible : les liens vers les comptes rendus subsistent.
 */
export type DevolutionMediateur =
  | { readonly _tag: 'transfere'; readonly vers: CoordinateurId }
  | { readonly _tag: 'supprime' }

export const devolutionDesTagsDuMediateur = (
  coordinateurs: readonly CoordinateurId[],
): DevolutionMediateur => {
  const distincts = [...new Set(coordinateurs)]
  const unique = distincts.length === 1 ? distincts[0] : undefined

  return unique === undefined
    ? { _tag: 'supprime' }
    : { _tag: 'transfere', vers: unique }
}

/**
 * Le sort des tags d'un coordinateur qui quitte ses équipes.
 *
 * Un tag est un vocabulaire de travail : le supprimer priverait de sens des
 * comptes rendus qui ne sont pas ceux du partant. Il ESSAIME donc chez chaque
 * médiateur qui l'a réellement employé — un tag utilisé par quatre médiateurs
 * en devient quatre. Un tag que personne n'a employé n'essaime nulle part.
 *
 * Dans les DEUX cas l'original s'en va : `essaime` veut dire « recopier, puis
 * retirer », et non « conserver ».
 */
export type EssaimageCoordinateur =
  | { readonly _tag: 'essaime'; readonly vers: readonly MediateurId[] }
  | { readonly _tag: 'supprime' }

export const essaimageDesTagsDuCoordinateur = (
  utilisateurs: readonly MediateurId[],
): EssaimageCoordinateur => {
  const distincts = [...new Set(utilisateurs)]

  return distincts.length === 0
    ? { _tag: 'supprime' }
    : { _tag: 'essaime', vers: distincts }
}
