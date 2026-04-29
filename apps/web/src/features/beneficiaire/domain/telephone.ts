import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

// Indicatifs français : métropole (33) + outre-mer (262, 590, 594, 596)
// Format national : 10 chiffres commençant par 0
// Format international : indicatif + 9 chiffres
export const TELEPHONE_PATTERN =
  /^(?:(?:\(\+(?:33|262|590|594|596)\)|\+(?:33|262|590|594|596)|00(?:33|262|590|594|596))[\s()./-]*(?:\d[\s()./-]*){8}\d|0\d(?:[\s./-]?\d){8})$/

export const Telephone = defineModel(
  z.string().regex(TELEPHONE_PATTERN).brand('Telephone'),
)

export type Telephone = Model.TypeOf<typeof Telephone>
