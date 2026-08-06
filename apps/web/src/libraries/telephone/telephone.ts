import { parsePhoneNumberFromString } from 'libphonenumber-js'

// Indicatifs dont les numéros se recomposent en format national français
// (0 + 9 chiffres) : métropole et outre-mer.
const INDICATIF_NATIONAL = /^\+(?:33|262|590|594|596)(\d{9})$/

const parPaires = (chiffres: string): string =>
  chiffres.replace(/(\d{2})(?=\d)/g, '$1 ')

/**
 * Format d'affichage « humain » : national par paires (`01 02 03 04 05`) pour
 * la métropole et l'outre-mer, format international standard de libphonenumber
 * (`+32 470 44 25 43`, `+352 621 365 161`) pour les autres pays. Accepte
 * `string` (pas seulement un téléphone canonique) : les frontières UI affichent
 * aussi des valeurs persistées avant la normalisation, rendues telles quelles si
 * non reconnues.
 *
 * Vit en librairie et non dans une feature : mettre en forme un numéro ne
 * dépend d'aucun domaine métier, et deux features l'affichent déjà (bénéficiaire
 * et employeuse). Le value object `Telephone`, lui, reste chez bénéficiaire —
 * c'est lui qui porte les invariants.
 */
export const telephoneDisplayString = (telephone: string): string => {
  const compact = telephone.replace(/[\s()./-]/g, '')
  const national = compact.match(INDICATIF_NATIONAL)
  if (national) return parPaires(`0${national[1]}`)
  if (/^0\d{9}$/.test(compact)) return parPaires(compact)
  const parsed = parsePhoneNumberFromString(compact)
  return parsed?.isValid() ? parsed.formatInternational() : telephone
}
