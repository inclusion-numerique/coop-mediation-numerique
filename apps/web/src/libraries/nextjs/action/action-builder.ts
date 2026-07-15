import { ZodError } from 'zod'
import type { ServerActionResult } from './result'

type Merge<A extends object, B extends object> = Omit<A, keyof B> & B

type Next<TCtx extends object, TResult, TError extends string> = (
  ctx: TCtx,
) => Promise<ServerActionResult<TResult, TError>>

export type PipeMiddleware<
  TCtxIn extends object,
  TCtxOut extends object,
  TResult,
  TError extends string = string,
> = (
  ctx: TCtxIn,
  rawInput: unknown,
  next: Next<TCtxOut, TResult, TError>,
) => Promise<ServerActionResult<TResult, TError>>

declare const actionInput: unique symbol

export type InputPipeMiddleware<
  TCtxIn extends object,
  TCtxOut extends object,
  TInput,
> = PipeMiddleware<TCtxIn, TCtxOut, unknown, string> & {
  readonly [actionInput]?: TInput
}

type AnyPipeMiddleware = PipeMiddleware<
  Record<string, unknown>,
  Record<string, unknown>,
  unknown,
  string
>

export type ActionFunction<TInput, TResult, TError extends string> = [
  TInput,
] extends [void]
  ? () => Promise<ServerActionResult<TResult, TError>>
  : (input: TInput) => Promise<ServerActionResult<TResult, TError>>

interface ActionBuilder<TCtx extends object, TInput = void> {
  use<TCtxOut extends object, TIn = TInput>(
    middleware: PipeMiddleware<TCtx, TCtxOut, unknown, string> & {
      readonly [actionInput]?: TIn
    },
  ): ActionBuilder<Merge<TCtx, TCtxOut>, TIn>

  execute<TResult = undefined, TError extends string = string>(
    handler: (
      ctx: TCtx,
    ) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>,
  ): ActionFunction<TInput, TResult, TError>
}

const toSuccessResult = <TResult, TError extends string>(
  result: ServerActionResult<TResult, TError> | TResult | undefined,
): ServerActionResult<TResult, TError> => {
  if (result == null) return { success: true, data: undefined as TResult }
  if (typeof result === 'object' && 'success' in result) return result
  return { success: true, data: result }
}

const buildPipeline = <TResult, TError extends string>(
  middlewares: AnyPipeMiddleware[],
  handler: (
    ctx: Record<string, unknown>,
  ) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>,
): ((
  ctx: Record<string, unknown>,
  rawInput: unknown,
) => Promise<ServerActionResult<TResult, TError>>) => {
  const execute =
    (index: number) =>
    async (
      ctx: Record<string, unknown>,
      rawInput: unknown,
    ): Promise<ServerActionResult<TResult, TError>> => {
      if (index >= middlewares.length)
        return toSuccessResult(await handler(ctx))

      const middleware = middlewares[index]

      return middleware
        ? (middleware(ctx, rawInput, (nextCtx) =>
            execute(index + 1)({ ...ctx, ...nextCtx }, rawInput),
          ) as Promise<ServerActionResult<TResult, TError>>)
        : toSuccessResult(await handler(ctx))
    }

  return execute(0)
}

type ActionBuilderOptions = {
  errorPrefix?: string
}

export const ACTION_INVALID_INPUT_ERROR = 'INVALID_INPUT'
export const ACTION_TECHNICAL_ERROR = 'TECHNICAL_ERROR'

const formatError =
  <TError>(options?: ActionBuilderOptions) =>
  (error: unknown): TError => {
    const code =
      error instanceof ZodError
        ? ACTION_INVALID_INPUT_ERROR
        : ACTION_TECHNICAL_ERROR

    return (
      options?.errorPrefix ? [options.errorPrefix, code].join('.') : code
    ) as TError
  }

export const actionBuilder = (
  options?: ActionBuilderOptions,
): ActionBuilder<object> => {
  const createBuilder = <TCtx extends object, TInput = void>(
    middlewares: AnyPipeMiddleware[],
  ): ActionBuilder<TCtx, TInput> => ({
    use: (middleware) =>
      createBuilder([...middlewares, middleware as AnyPipeMiddleware]),

    execute: <TResult = undefined, TError extends string = string>(
      handler: (
        ctx: TCtx,
      ) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>,
    ) => {
      const pipeline = buildPipeline<TResult, TError>(
        middlewares,
        handler as (
          ctx: Record<string, unknown>,
        ) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>,
      )

      const action = async (
        rawInput?: unknown,
      ): Promise<ServerActionResult<TResult, TError>> => {
        try {
          return await pipeline({}, rawInput)
        } catch (error: unknown) {
          const { isRedirectError } = await import('./action-error')
          if (isRedirectError(error)) throw error

          console.error('Server action failed', error)
          const Sentry = await import('@sentry/nextjs')
          Sentry.captureException?.(error)

          return { success: false, error: formatError<TError>(options)(error) }
        }
      }

      return action as ActionFunction<TInput, TResult, TError>
    },
  })

  return createBuilder<object>([])
}
