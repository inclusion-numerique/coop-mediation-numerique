'use client'

import {
  DsfrProviderBase,
  type DsfrProviderProps,
  StartDsfrOnHydration,
} from '@codegouvfr/react-dsfr/next-app-router'
import Link from 'next/link'
import { defaultColorScheme } from './default-color-scheme'

export const DsfrProvider = (props: DsfrProviderProps) => (
  <DsfrProviderBase
    defaultColorScheme={defaultColorScheme}
    Link={Link}
    {...props}
  />
)

export { default as Display } from '@codegouvfr/react-dsfr/Display/Display'
export { StartDsfrOnHydration }
