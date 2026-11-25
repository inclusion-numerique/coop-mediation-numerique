'use client'

import { inject, keyFor } from '@/libraries/nextjs/injection'

const SIGNALER_KEY = keyFor<(erreur: unknown) => void>('telemetry.signaler')

export const useSignaler = () => inject(SIGNALER_KEY)
