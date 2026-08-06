import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code postal : 5 chiffres. Il n'identifie pas une commune (plusieurs communes
 * peuvent le partager) — c'est le code INSEE qui le fait — mais il sert à
 * l'adressage et au géocodage. Les 5 chiffres couvrent aussi les DOM (`97xxx`,
 * `98xxx`) : aucun territoire français n'est exclu par ce format.
 *
 * La normalisation (retrait de TOUS les espaces, `'44 000'` → `'44000'`) est
 * posée dans le schéma, donc elle voyage avec `.schema` lorsqu'il est composé
 * dans `AdresseEmployeuse` ou `AdresseAGeocoder`. Contrairement à la casse, le
 * retrait des espaces internes n'a pas d'équivalent natif chez zod, d'où le
 * `transform().pipe()` là où `CodeInsee` se contente de `.trim().toUpperCase()`.
 */
export const CodePostal = defineModel(
  z
    .string()
    .transform((value) => value.replaceAll(/\s/g, ''))
    .pipe(
      z
        .string()
        .regex(/^\d{5}$/)
        .brand('CodePostal'),
    ),
)

export type CodePostal = Model.TypeOf<typeof CodePostal>
