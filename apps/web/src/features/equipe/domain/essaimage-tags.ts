import type { MediateurId } from './mediateur-id'

/**
 * Le sort des tags d'un coordinateur qui quitte ses équipes.
 *
 * Un tag de coordinateur est un vocabulaire partagé : le supprimer priverait de
 * sens des comptes rendus qui ne sont pas ceux du partant. Il ESSAIME donc chez
 * chaque médiateur qui l'a réellement employé — un tag utilisé par quatre
 * médiateurs en devient quatre. Un tag que personne n'a employé n'essaime nulle
 * part.
 *
 * Dans les DEUX cas l'original s'en va : `essaime` veut dire « recopier, puis
 * retirer », et non « conserver ».
 *
 * Les tags d'un MÉDIATEUR, eux, ne se transmettent pas : ils lui sont propres et
 * partent avec lui. Il n'y a donc aucune décision à prendre de ce côté, et pas
 * de fonction pour l'exprimer.
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
