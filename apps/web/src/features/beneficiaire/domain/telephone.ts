import { defineModel, type Model } from '@app/web/libraries/model'
import { type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js'
import { z } from 'zod'

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

const compactOf = (raw: string): string => raw.replace(/[\s()./-]/g, '')

// Région à passer à libphonenumber pour interpréter un numéro *national* : le
// DOM déduit du préfixe, à défaut la métropole. Sans effet sur les numéros déjà
// internationaux (`+…`, `00…`), qui portent leur propre indicatif.
const regionFor = (compact: string): CountryCode =>
  DOM_REGION.find(([prefix]) => prefix.test(compact))?.[1] ?? 'FR'

/**
 * Forme canonique : international compact E.164 (`+33XXXXXXXXX`, `+262…`, mais
 * aussi `+32…`, `+44…`, `+237…` — tout indicatif pays valide). Accepte le
 * national français/DOM, l'international (`+`, `00`, `(+…)`) et les séparateurs,
 * délègue le parsing et la validation par pays à libphonenumber, et sort
 * toujours normalisé. Reste strict : un numéro non valide pour son pays (ex.
 * indicatif de zone nord-américain inexistant) est rejeté.
 */
export const Telephone = defineModel(
  z
    .string()
    .transform((raw, ctx) => {
      const parsed = parsePhoneNumberFromString(raw, regionFor(compactOf(raw)))
      if (!parsed?.isValid()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid' })
        return z.NEVER
      }
      return parsed.number
    })
    .brand('Telephone'),
)

export type Telephone = Model.TypeOf<typeof Telephone>

// Indicatifs dont les numéros se recomposent en format national français
// (0 + 9 chiffres) : métropole et outre-mer.
const INDICATIF_NATIONAL = /^\+(?:33|262|590|594|596)(\d{9})$/

const parPaires = (chiffres: string): string =>
  chiffres.replace(/(\d{2})(?=\d)/g, '$1 ')

/**
 * Format d'affichage « humain » : national par paires (`01 02 03 04 05`) pour
 * la métropole et l'outre-mer, format international standard de libphonenumber
 * (`+32 470 44 25 43`, `+352 621 365 161`) pour les autres pays. Accepte
 * `string` (pas seulement `Telephone`) : les frontières UI affichent aussi des
 * valeurs persistées avant la normalisation canonique, rendues telles quelles
 * si non reconnues.
 */
export const telephoneDisplayString = (telephone: string): string => {
  const compact = telephone.replace(/[\s()./-]/g, '')
  const national = compact.match(INDICATIF_NATIONAL)
  if (national) return parPaires(`0${national[1]}`)
  if (/^0\d{9}$/.test(compact)) return parPaires(compact)
  const parsed = parsePhoneNumberFromString(compact)
  return parsed?.isValid() ? parsed.formatInternational() : telephone
}
