import { z } from 'zod'

export interface Model<S extends z.ZodType> {
  (input: z.input<S>): z.output<S>
  readonly schema: S
  // Forme totale du smart constructor : même schéma, même brand, mais rend
  // `null` au lieu de jeter. Réservée aux frontières de transfert / ingestion
  // de données non fiables (legacy en base, API externe) — voir libraries/model.
  safe(input: z.input<S>): z.output<S> | null
}

export namespace Model {
  export type TypeOf<M> = M extends Model<infer S> ? z.output<S> : never
  export type InputOf<M> = M extends Model<infer S> ? z.input<S> : never
}

/**
 * Un modèle n'a qu'une source de vérité : son schéma. La normalisation d'une
 * forme canonique (casse, espaces, reformatage) se pose DANS le schéma —
 * `z.string().trim().toLowerCase()`, `.transform(...)`, `z.preprocess(...)` —
 * et jamais autour de lui.
 *
 * La raison est structurelle : `.schema` est destiné à être composé dans le
 * schéma d'un autre modèle (`AdresseEmployeuse` imbrique `CodePostal.schema` et
 * `CodeInsee.schema`). Tout ce qui vivrait à côté du schéma, dans le smart
 * constructeur, serait alors silencieusement contourné — la valeur passerait par
 * la validation sans passer par la normalisation. `defineModel` n'accepte donc
 * délibérément aucun préprocesseur : il n'existe qu'une seule façon de faire,
 * et elle survit à la composition.
 */
export const defineModel = <S extends z.ZodType>(schema: S): Model<S> => {
  const safe = (input: z.input<S>): z.output<S> | null => {
    try {
      const result = schema.safeParse(input)
      return result.success ? result.data : null
    } catch {
      return null
    }
  }

  return Object.assign(
    (input: z.input<S>): z.output<S> => schema.parse(input),
    { schema, safe },
  )
}
