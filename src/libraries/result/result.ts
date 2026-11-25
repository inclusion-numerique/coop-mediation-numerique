export type Success<T> = { readonly success: true; readonly data: T }
export type Failure<E> = { readonly success: false; readonly error: E }
export type Result<T, E> = Success<T> | Failure<E>

export const success = <T>(data: T): Success<T> => ({ success: true, data })
export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error,
})
