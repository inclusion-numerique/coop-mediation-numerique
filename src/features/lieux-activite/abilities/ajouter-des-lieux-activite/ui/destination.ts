import { hrefDuLieu } from '../../../ui/href-du-lieu'
import type { LieuAuPanier } from './panier'

export const destination = (
  lieux: readonly LieuAuPanier[],
  rejoints: readonly string[],
  retourHref: string,
): string => {
  const premier = lieux.at(0)

  return lieux.length === 1 && rejoints.length === 1 && premier != null
    ? hrefDuLieu({ id: rejoints[0], codeInsee: premier.codeInsee ?? null })
    : retourHref
}
