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

export const defineModel = <S extends z.ZodType>(
  schema: S,
  transform?: (input: z.input<S>) => z.input<S>,
): Model<S> => {
  const prepared = (input: z.input<S>): z.input<S> =>
    transform ? transform(input) : input

  const safe = (input: z.input<S>): z.output<S> | null => {
    try {
      const result = schema.safeParse(prepared(input))
      return result.success ? result.data : null
    } catch {
      return null
    }
  }

  return Object.assign(
    (input: z.input<S>): z.output<S> => schema.parse(prepared(input)),
    { schema, safe },
  )
}
