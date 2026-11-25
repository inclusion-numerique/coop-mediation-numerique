'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const ImpressionPreteContext = createContext<{
  readonly prete: boolean
  readonly signaler: () => void
}>({ prete: true, signaler: () => undefined })

export const ImpressionPreteProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [prete, setPrete] = useState(false)
  const signaler = useCallback(() => setPrete(true), [])
  return (
    <ImpressionPreteContext.Provider value={{ prete, signaler }}>
      {children}
    </ImpressionPreteContext.Provider>
  )
}

export const ImpressionPrete = () => {
  const { signaler } = useContext(ImpressionPreteContext)
  useEffect(() => signaler(), [signaler])
  return null
}

export const useImpressionPrete = (): boolean =>
  useContext(ImpressionPreteContext).prete
