import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code postal : 5 chiffres. Il n'identifie pas une commune (plusieurs communes
 * peuvent le partager) — c'est le code INSEE qui le fait — mais il sert à
 * l'adressage et au géocodage. Les 5 chiffres couvrent aussi les DOM (`97xxx`,
 * `98xxx`) : aucun territoire français n'est exclu par ce format.
 *
 * La normalisation (retrait de TOUS les espaces, `'44 000'` → `'44000'`) vit
 * dans le schéma et non dans le second argument de `defineModel`, contrairement
 * à `CodeInsee`. Ce second argument n'est appliqué que par le smart constructeur
 * lui-même (`CodePostal(...)` / `.safe(...)`), jamais lorsque `.schema` est
 * imbriqué dans le schéma d'un autre modèle — or c'est précisément l'usage ici,
 * dans `AdresseEmployeuse`. Mise dans le schéma, elle voyage avec lui.
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
