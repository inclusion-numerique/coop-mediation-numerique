import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code INSEE de la commune : 5 caractères, chiffres sauf la Corse (`2A`/`2B`).
 * C'est la clé de rattachement territorial de l'employeuse — elle sert au
 * filtre par département et par commune, donc on la valide plutôt que de la
 * transporter en `string`.
 */
export const CodeInsee = defineModel(
  z
    .string()
    .trim()
    .regex(/^(?:\d{5}|2[AB]\d{3})$/)
    .brand('CodeInsee'),
  (input: string) => input.toUpperCase(),
)

export type CodeInsee = Model.TypeOf<typeof CodeInsee>
