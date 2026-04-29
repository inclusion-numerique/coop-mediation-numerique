import type { InjectionKey } from 'piqure/src/Providing'
import type { PipeMiddleware } from '../action-builder'
import type { ServerActionResult } from '../result'

type Provide = <T>(key: InjectionKey<T>, value: T) => void

export const createWithProvide =
  (provide: Provide) =>
  <T>(
    injectionKey: InjectionKey<T>,
    implementation: T,
  ): PipeMiddleware<object, object, unknown> =>
  async (_ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    provide(injectionKey, implementation)
    return next({})
  }
