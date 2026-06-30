import type { z } from 'zod'
import type { PipeMiddleware } from '../action-builder'
import type { ServerActionResult } from '../result'

export const withInput =
  <S extends z.ZodType>(
    schema: S,
  ): PipeMiddleware<object, { input: z.output<S> }, unknown> =>
  async (_ctx, rawInput, next): Promise<ServerActionResult<unknown>> =>
    next({ input: schema.parse(rawInput) })
