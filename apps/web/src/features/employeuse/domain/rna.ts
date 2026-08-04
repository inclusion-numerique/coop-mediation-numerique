import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Numéro RNA (répertoire national des associations) : un `W` suivi de 9
 * chiffres. Porté par les employeuses associatives, en alternative au SIRET.
 * Comme le SIRET, il est lu depuis `main` via la forme totale (`.safe`).
 */
export const Rna = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^W\d{9}$/)
    .brand('Rna'),
)

export type Rna = Model.TypeOf<typeof Rna>
