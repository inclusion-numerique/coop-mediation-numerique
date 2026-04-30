'use client'

import type { InjectionKey } from 'piqure/src/Providing'
import { useActionState } from 'react'
import type {
  ServerActionError,
  ServerActionResult,
  ServerActionSuccess,
} from './result'
import { ERROR_PREFIX_KEY } from './technical-error-formatter'

type Inject = <T>(key: InjectionKey<T>) => T

type ExtractResult<T> = T extends (
  formData: never,
) => Promise<ServerActionResult<infer R>>
  ? R
  : never

type ExtractError<T> = T extends (
  formData: never,
) => Promise<ServerActionResult<unknown, infer E>>
  ? E
  : never

type ExtractFormData<T> = T extends (
  formData: infer F,
) => Promise<ServerActionResult<unknown>>
  ? F
  : never

const formatError = (prefix: string | undefined) =>
  prefix ? [prefix, '0'].join('.') : '0'

export const createUseServerAction =
  (inject: Inject) =>
  <TAction extends (formData: never) => Promise<ServerActionResult<unknown>>>(
    action: TAction,
    handlers?: {
      onSuccess?: (state: ServerActionSuccess<ExtractResult<TAction>>) => void
      onError?: (state: ServerActionError<ExtractError<TAction>>) => void
    },
  ): [
    (formData: ExtractFormData<TAction>) => void | Promise<void>,
    boolean,
    ServerActionResult<ExtractResult<TAction>, ExtractError<TAction>> | null,
  ] => {
    type TResult = ExtractResult<TAction>
    type TError = ExtractError<TAction>
    type TFormData = ExtractFormData<TAction>

    const [state, dispatch, isPending] = useActionState<
      ServerActionResult<TResult, TError> | null,
      TFormData
    >(
      async (
        _: ServerActionResult<TResult, TError> | null,
        formData: TFormData,
      ): Promise<ServerActionResult<TResult, TError>> => {
        try {
          const result = await (
            action as unknown as (
              formData: TFormData,
            ) => Promise<ServerActionResult<TResult, TError>>
          )(formData)
          result.success
            ? handlers?.onSuccess?.(result)
            : handlers?.onError?.(result)
          return result
        } catch {
          const errorResult = {
            success: false,
            error: formatError(inject(ERROR_PREFIX_KEY)),
          } as ServerActionError<TError>
          handlers?.onError?.(errorResult)
          return errorResult
        }
      },
      null,
    )
    return [dispatch, isPending, state]
  }
