import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code INSEE de la commune : 5 caractères, chiffres sauf la Corse (`2A`/`2B`).
 * C'est la clé de rattachement territorial de l'employeuse — elle sert au
 * filtre par département et par commune, donc on la valide plutôt que de la
 * transporter en `string`.
 *
 * La normalisation (`trim` + majuscules, `'2a004'` → `'2A004'`) est posée dans
 * le schéma, donc elle voyage avec `.schema` : les deux consommateurs sont des
 * schémas composés (`AdresseEmployeuse`, `AdresseAGeocoder`), où un code corse
 * en minuscules était auparavant rejeté.
 */
export const CodeInsee = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(?:\d{5}|2[AB]\d{3})$/)
    .brand('CodeInsee'),
)

export type CodeInsee = Model.TypeOf<typeof CodeInsee>
