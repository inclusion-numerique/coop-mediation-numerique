import { StartDsfrOnHydration } from '@app/web/configuration/dsfr'
import type { PropsWithChildren } from 'react'

const Template = ({ children }: PropsWithChildren) => (
  <>
    <StartDsfrOnHydration />
    {children}
  </>
)

export default Template
