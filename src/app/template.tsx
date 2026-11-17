import type { PropsWithChildren } from 'react'
import { StartDsfrOnHydration } from '@/configuration/dsfr'

const Template = ({ children }: PropsWithChildren) => (
  <>
    <StartDsfrOnHydration />
    {children}
  </>
)

export default Template
