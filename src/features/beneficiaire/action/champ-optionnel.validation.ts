import { z } from 'zod'

const blankToUndefined = (value: unknown): unknown =>
  value == null || (typeof value === 'string' && value.trim() === '')
    ? undefined
    : value

export const optional = <S extends z.ZodType>(schema: S) =>
  z.preprocess(blankToUndefined, schema.optional())
