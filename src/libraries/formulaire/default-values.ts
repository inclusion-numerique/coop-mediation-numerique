export type DefaultValues<T> = {
  [K in keyof T]?: DefaultValues<T[K]> | undefined
}
