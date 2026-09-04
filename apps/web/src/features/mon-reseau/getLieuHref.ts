import { getDepartementCodeForLieu } from '@app/web/features/mon-reseau/getDepartementCodeForLieu'

/**
 * Où mène la carte d'un lieu : sa fiche, sous l'annuaire du département où il
 * se trouve.
 *
 * Le département vient du lieu et non de la page : une recherche peut ramener
 * un lieu limitrophe, et sa fiche vit sous son propre département.
 */
export const getLieuHref = (lieu: {
  id: string
  codeInsee: string | null
}): string =>
  `/coop/mon-reseau/${getDepartementCodeForLieu(lieu)}/lieux/${lieu.id}`
