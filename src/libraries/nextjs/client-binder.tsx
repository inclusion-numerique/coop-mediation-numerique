'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import type { InjectionKey, ProvideLazy } from '@/libs/injection/types'

export const createClientBinder =
  (provideLazy: ProvideLazy) =>
  <TBind, TTo extends TBind>({
    bind,
    to,
    children,
  }: {
    bind: InjectionKey<TBind>
    to: TTo
    children: ReactNode
  }) => {
    const hasProvided = useRef(false)

    if (!hasProvided.current) {
      provideLazy(bind, () => to)
      hasProvided.current = true
    }

    useEffect(() => {
      provideLazy(bind, () => to)
    }, [bind, to])

    return children
  }
