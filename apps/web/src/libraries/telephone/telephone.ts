import { type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js'

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

// Les DOM partagent le format national de la métropole (0 + zone) mais relèvent
// d'un indicatif pays distinct. En défaut région « FR », libphonenumber lirait
// `0262…`/`0269…` comme métropole (+33) : on route donc les préfixes DOM connus
// (fixe et mobile) vers leur région propre pour obtenir le bon indicatif
// (+262 Réunion/Mayotte, +590 Guadeloupe, +594 Guyane, +596 Martinique).
const DOM_REGION: ReadonlyArray<readonly [RegExp, CountryCode]> = [
  [/^0(?:262|263|692|693)/, 'RE'], // La Réunion (fixe + mobile)
  [/^0(?:269|639)/, 'YT'], // Mayotte (fixe + mobile)
  [/^0(?:590|690)/, 'GP'], // Guadeloupe, Saint-Martin, Saint-Barthélemy
  [/^0(?:594|694)/, 'GF'], // Guyane
  [/^0(?:596|696)/, 'MQ'], // Martinique
]

// Région à passer à libphonenumber pour interpréter un numéro *national* : le
// DOM déduit du préfixe, à défaut la métropole. Sans effet sur les numéros déjà
// internationaux (`+…`, `00…`), qui portent leur propre indicatif.
const regionDe = (compact: string): CountryCode =>
  DOM_REGION.find(([prefixe]) => prefixe.test(compact))?.[1] ?? 'FR'

/**
 * La forme canonique d'un numéro : international compact E.164
 * (`+33XXXXXXXXX`, `+262…`, mais aussi `+32…`, `+237…`), ou `null` si rien de
 * valide ne s'y lit.
 *
 * Accepte ce qu'un humain tape — national français ou DOM, international sous
 * toutes ses formes (`+`, `00`, `(+…)`), séparateurs quelconques — et délègue à
 * libphonenumber le parsing et la validation par pays. Reste strict sur le
 * résultat : un numéro impossible pour son pays est refusé.
 *
 * Vit en librairie parce que reconnaître un numéro ne dépend d'aucun domaine :
 * le value object `Telephone` du bénéficiaire s'appuie dessus, et les lieux
 * d'activité y confrontent leur saisie avant de la mesurer au schéma national.
 */
export const telephoneCanonique = (telephone: string): string | null => {
  const compact = telephone.replace(/[\s()./-]/g, '')
  const parse = parsePhoneNumberFromString(compact, regionDe(compact))

  return parse?.isValid() ? parse.number : null
}
