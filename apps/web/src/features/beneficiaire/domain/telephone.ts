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

// Indicatifs dont les numéros se recomposent en format national français
// (0 + 9 chiffres) : métropole et outre-mer.
const INDICATIF_NATIONAL = /^\+(?:33|262|590|594|596)(\d{9})$/

const parPaires = (chiffres: string): string =>
  chiffres.replace(/(\d{2})(?=\d)/g, '$1 ')

/**
 * Format d'affichage « humain » : national par paires (`01 02 03 04 05`) pour
 * la métropole et l'outre-mer, indicatif détaché pour les autres pays.
 * Accepte `string` (pas seulement `Telephone`) : les frontières UI affichent
 * aussi des valeurs persistées avant la normalisation canonique, rendues
 * telles quelles si non reconnues.
 */
export const telephoneDisplayString = (telephone: string): string => {
  const compact = telephone.replace(/[\s()./-]/g, '')
  const national = compact.match(INDICATIF_NATIONAL)
  if (national) return parPaires(`0${national[1]}`)
  if (/^0\d{9}$/.test(compact)) return parPaires(compact)
  const international = compact.match(/^(\+\d{3})(\d+)$/)
  return international ? `${international[1]} ${international[2]}` : telephone
}
