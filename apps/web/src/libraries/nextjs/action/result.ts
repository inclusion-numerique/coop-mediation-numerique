export type ServerActionSuccess<T> = { success: true; data: T }

export type ServerActionError<TError extends string = string> = {
  success: false
  error: TError
}

export type ServerActionResult<
  TSuccess = void,
  TError extends string = string,
> = ServerActionSuccess<TSuccess> | ServerActionError<TError>

export const ServerActionError = <T extends string>(
  error: T,
): ServerActionError<T> => ({
  success: false,
  error,
})

export const ServerActionSuccess = <T = void>(
  data?: T,
): ServerActionSuccess<T> => ({
  success: true,
  data: (data ?? undefined) as T,
})
