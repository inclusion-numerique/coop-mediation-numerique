import { subDays } from 'date-fns'

export const SEUIL_D_INACTIVITE_EN_JOURS = 30

export type DerniereActivite =
  | { readonly _tag: 'Jamais' }
  | { readonly _tag: 'Le'; readonly date: Date }

export type StatutDActivitePublic =
  | { readonly _tag: 'Actif' }
  | { readonly _tag: 'InactifDepuis'; readonly derniereActivite: Date }
  | { readonly _tag: 'JamaisActif' }

export const statutDActivitePublic = (
  derniere: DerniereActivite,
  maintenant: Date,
): StatutDActivitePublic => {
  if (derniere._tag === 'Jamais') return { _tag: 'JamaisActif' }
  return derniere.date > subDays(maintenant, SEUIL_D_INACTIVITE_EN_JOURS)
    ? { _tag: 'Actif' }
    : { _tag: 'InactifDepuis', derniereActivite: derniere.date }
}
