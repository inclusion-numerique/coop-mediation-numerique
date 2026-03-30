import { AsyncLocalStorage } from 'node:async_hooks'
import type { InjectionKey, Provide } from 'piqure/src/Providing'

type ContainerStore = Map<unknown, unknown>

const asyncLocalStorage = new AsyncLocalStorage<ContainerStore>()

export const runWithContainer = <T>(fn: () => Promise<T>): Promise<T> =>
  asyncLocalStorage.run(new Map(), fn)

export const inject = <T>(key: InjectionKey<T>): T => {
  const store = asyncLocalStorage.getStore()
  if (!store) {
    throw new Error('inject() called outside of container context')
  }
  if (!store.has(key)) {
    throw new Error(`Key not provided: ${key.toString()}`)
  }
  return store.get(key) as T
}

export const provide: Provide = <T>(key: InjectionKey<T>, value: T): void => {
  const store = asyncLocalStorage.getStore()
  if (!store) {
    throw new Error('provide() called outside of container context')
  }
  store.set(key, value)
}
