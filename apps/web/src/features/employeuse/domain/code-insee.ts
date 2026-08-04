import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code INSEE de la commune : 5 caractères, chiffres sauf la Corse (`2A`/`2B`).
 * C'est la clé de rattachement territorial de l'employeuse — elle sert au
 * filtre par département et par commune, donc on la valide plutôt que de la
 * transporter en `string`.
 *
 * La normalisation (`trim` + majuscules, `'2a004'` → `'2A004'`) vit dans le
 * schéma et non dans le second argument de `defineModel` : ce dernier n'est
 * appliqué que par le smart constructeur lui-même (`CodeInsee(...)` /
 * `.safe(...)`), jamais lorsque `.schema` est imbriqué dans le schéma d'un autre
 * modèle. Or les deux consommateurs réels sont exactement de ce genre
 * (`AdresseEmployeuse`, `AdresseAGeocoder`) : un code corse en minuscules y
 * était rejeté, ce que `CodeInsee('2a004')` acceptait pourtant. Mise dans le
 * schéma, la normalisation voyage avec lui.
 */
export const CodeInsee = defineModel(
  z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .pipe(
      z
        .string()
        .regex(/^(?:\d{5}|2[AB]\d{3})$/)
        .brand('CodeInsee'),
    ),
)

export type CodeInsee = Model.TypeOf<typeof CodeInsee>
