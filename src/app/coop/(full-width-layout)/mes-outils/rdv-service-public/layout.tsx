import { PropsWithChildren } from 'react'
import { CadreRdvServicePublic } from '@/features/rdvsp/ui/layouts/CadreRdvServicePublic'

const RdvServicePublicLayout = ({ children }: PropsWithChildren) => (
  <CadreRdvServicePublic>{children}</CadreRdvServicePublic>
)

export default RdvServicePublicLayout
