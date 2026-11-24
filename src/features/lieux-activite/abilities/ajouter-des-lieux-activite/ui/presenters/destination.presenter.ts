import { hrefDuLieu } from '../../../../ui/presenters/href-du-lieu.presenter'
import type { LieuAuPanier } from '../forms/panier.form-data'

export const destination = (
  lieux: readonly LieuAuPanier[],
  rejoints: readonly string[],
  retourHref: string,
): string => {
  const [lieu, ...autresLieux] = lieux
  const [rejoint, ...autresRejoints] = rejoints

  return lieu !== undefined &&
    rejoint !== undefined &&
    autresLieux.length === 0 &&
    autresRejoints.length === 0
    ? hrefDuLieu({ id: rejoint, codeInsee: lieu.codeInsee ?? null })
    : retourHref
}
