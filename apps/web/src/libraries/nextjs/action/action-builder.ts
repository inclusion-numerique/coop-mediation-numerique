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

type AnyPipeMiddleware = PipeMiddleware<
  Record<string, unknown>,
  Record<string, unknown>,
  unknown,
  string
>

interface ActionBuilder<TCtx extends object> {
  use<TCtxOut extends object>(
    middleware: PipeMiddleware<TCtx, TCtxOut, unknown, string>,
  ): ActionBuilder<Merge<TCtx, TCtxOut>>

  execute<TResult = undefined, TError extends string = string>(
    handler: (
      ctx: TCtx,
    ) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>,
  ): (input?: unknown) => Promise<ServerActionResult<TResult, TError>>
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

const formatError =
  <TError>(options?: ActionBuilderOptions) =>
  (error: unknown): TError =>
    (options?.errorPrefix
      ? [options.errorPrefix, error].join('.')
      : error) as TError

export const actionBuilder = (
  options?: ActionBuilderOptions,
): ActionBuilder<object> => {
  const createBuilder = <TCtx extends object>(
    middlewares: AnyPipeMiddleware[],
  ): ActionBuilder<TCtx> => ({
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

      return async (
        rawInput?: unknown,
      ): Promise<ServerActionResult<TResult, TError>> => {
        try {
          return await pipeline({}, rawInput)
        } catch (error: unknown) {
          const { isRedirectError } = await import('./action-error')
          if (isRedirectError(error)) throw error
          return { success: false, error: formatError<TError>(options)(error) }
        }
      }
    },
  })

  return createBuilder<object>([])
}
