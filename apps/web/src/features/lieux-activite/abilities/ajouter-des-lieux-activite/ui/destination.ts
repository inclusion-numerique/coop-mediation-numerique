import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import type { LieuAuPanier } from './panier'

/**
 * Où mène l'ajout, une fois fait.
 *
 * Un panier d'un seul lieu mène à sa fiche : c'est ce qu'on est venu chercher.
 * Au-delà, aucune fiche ne résume l'ajout, et l'on revient d'où l'on vient.
 */
export const destination = (
  lieux: readonly LieuAuPanier[],
  rejoints: readonly string[],
  retourHref: string,
): string => {
  const premier = lieux.at(0)

  return lieux.length === 1 && rejoints.length === 1 && premier != null
    ? `/coop/mon-reseau/${getDepartementCodeFromCodeInsee(
        premier.codeInsee ?? '',
      )}/lieux/${rejoints[0]}`
    : retourHref
}
