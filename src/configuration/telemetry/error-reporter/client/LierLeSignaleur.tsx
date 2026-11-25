'use client'

import type { ReactNode } from 'react'
import { ClientBinder, keyFor } from '@/libraries/nextjs/injection'
import { signaler } from './signaler'

const SIGNALER_KEY = keyFor<(erreur: unknown) => void>('telemetry.signaler')

export const LierLeSignaleur = ({ children }: { children: ReactNode }) => (
  <ClientBinder bind={SIGNALER_KEY} to={signaler}>
    {children}
  </ClientBinder>
)
