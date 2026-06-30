import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

// Indicatifs acceptés : France métropole (33) + outre-mer (262, 590, 594, 596)
// + Luxembourg (352, zone frontalière). Format national : 10 chiffres commençant
// par 0. Format international : indicatif + 9 chiffres.
export const TELEPHONE_PATTERN =
  /^(?:(?:\(\+(?:33|262|352|590|594|596)\)|\+(?:33|262|352|590|594|596)|00(?:33|262|352|590|594|596))[\s()./-]*(?:\d[\s()./-]*){8}\d|0\d(?:[\s./-]?\d){8})$/

// Indicatif pays déduit du préfixe d'un numéro national outre-mer ;
// à défaut, métropole (33).
const COUNTRY_CODE_BY_NATIONAL_PREFIX: Record<string, string> = {
  '262': '262', // La Réunion
  '269': '262', // Mayotte
  '590': '590', // Guadeloupe, Saint-Martin, Saint-Barthélemy
  '594': '594', // Guyane
  '596': '596', // Martinique
}

/**
 * Forme canonique : international compact (`+33XXXXXXXXX`, `+262…`). Accepte le
 * national, l'international (`+`, `00`, `(+…)`) et les séparateurs ; sort
 * toujours normalisé.
 */
const toInternational = (raw: string): string => {
  const compact = raw.replace(/[\s()./-]/g, '')
  if (compact.startsWith('+')) return compact
  if (compact.startsWith('00')) return `+${compact.slice(2)}`
  const national = compact.slice(1)
  const countryCode =
    COUNTRY_CODE_BY_NATIONAL_PREFIX[national.slice(0, 3)] ?? '33'
  return `+${countryCode}${national}`
}

export const Telephone = defineModel(
  z
    .string()
    .regex(TELEPHONE_PATTERN)
    .transform(toInternational)
    .brand('Telephone'),
)

export type Telephone = Model.TypeOf<typeof Telephone>
