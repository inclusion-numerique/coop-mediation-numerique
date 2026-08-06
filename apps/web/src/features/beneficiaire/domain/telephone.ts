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

// La mise en forme d'affichage vit dans `libraries/telephone` : elle ne dépend
// d'aucun domaine, et l'employeuse l'utilise aussi pour son contact référent.
