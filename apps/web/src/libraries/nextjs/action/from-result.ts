import {
  ServerActionError,
  type ServerActionResult,
  ServerActionSuccess,
} from './result'

type ErrorMap<TError extends { _tag: string }> = {
  [K in TError['_tag']]: string
}

type ExtractErrorValues<TMap extends Record<string, string>> = TMap[keyof TMap]

type FromResultOptions<
  TResult,
  TError extends { _tag: string },
  TErrorMap extends ErrorMap<TError>,
> = {
  onError: TErrorMap
  onSuccess?: (result: TResult) => void
}

export const fromResult =
  <
    TCtx,
    TResult,
    TError extends { _tag: string },
    const TErrorMap extends ErrorMap<TError>,
  >(
    handler: (
      ctx: TCtx,
    ) => Promise<
      { success: true; data: TResult } | { success: false; error: TError }
    >,
    options: FromResultOptions<TResult, TError, TErrorMap>,
  ): ((
    ctx: TCtx,
  ) => Promise<ServerActionResult<TResult, ExtractErrorValues<TErrorMap>>>) =>
  async (
    ctx: TCtx,
  ): Promise<ServerActionResult<TResult, ExtractErrorValues<TErrorMap>>> => {
    const result = await handler(ctx)

    if (!result.success) {
      const tag = result.error._tag
      return ServerActionError(
        options.onError[tag as keyof TErrorMap],
      ) as ServerActionResult<TResult, ExtractErrorValues<TErrorMap>>
    }

    options.onSuccess?.(result.data)
    return ServerActionSuccess(result.data)
  }
