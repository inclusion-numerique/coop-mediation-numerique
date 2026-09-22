import {
  nettoyerTelephone,
  Telephone,
  telephoneCanonique,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { type LieuAReprendre, nonVide } from '../../../domain'

export type TelephoneAReprendre =
  | { readonly verdict: 'a-corriger'; readonly corrige: Telephone }
  | { readonly verdict: 'a-effacer'; readonly valeur: string }

export const telephoneNormalise = (
  telephone: string,
  codePostal: string,
): Telephone | null => {
  const canonique = telephoneCanonique(nettoyerTelephone(codePostal)(telephone))

  return canonique == null ? null : Telephone.safe(canonique)
}

export const telephoneAReprendre = (
  lieu: LieuAReprendre,
): TelephoneAReprendre | null => {
  const valeur = nonVide(lieu.telephone)

  if (valeur == null) return null

  const normalise = telephoneNormalise(valeur, lieu.codePostal)

  if (normalise == null)
    return Telephone.safe(valeur) == null
      ? { verdict: 'a-effacer', valeur }
      : null

  return normalise === valeur
    ? null
    : { verdict: 'a-corriger', corrige: normalise }
}
