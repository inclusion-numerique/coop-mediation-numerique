import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code postal : 5 chiffres. Il n'identifie pas une commune (plusieurs communes
 * peuvent le partager) — c'est le code INSEE qui le fait — mais il sert à
 * l'adressage et au géocodage.
 */
export const CodePostal = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{5}$/)
    .brand('CodePostal'),
)

export type CodePostal = Model.TypeOf<typeof CodePostal>
