import type { z } from 'zod'
import type { InputPipeMiddleware } from '../action-builder'
import type { ServerActionResult } from '../result'

export const withInput =
  <S extends z.ZodType>(
    schema: S,
  ): InputPipeMiddleware<object, { input: z.output<S> }, z.input<S>> =>
  async (_ctx, rawInput, next): Promise<ServerActionResult<unknown>> =>
    next({ input: schema.parse(rawInput) })
