import { z } from 'zod'

export interface Model<S extends z.ZodType> {
  (input: z.input<S>): z.output<S>
  readonly schema: S
}

export namespace Model {
  export type TypeOf<M> = M extends Model<infer S> ? z.output<S> : never
  export type InputOf<M> = M extends Model<infer S> ? z.input<S> : never
}

export const defineModel = <S extends z.ZodType>(
  schema: S,
  transform?: (input: z.input<S>) => z.input<S>,
): Model<S> =>
  Object.assign(
    (input: z.input<S>): z.output<S> =>
      schema.parse(transform ? transform(input) : input),
    { schema },
  )
