import { PropsWithChildren } from 'react'
import { RdvServicePublicLayout } from '@/features/rdvsp/ui/layouts/RdvServicePublicLayout'

const Layout = ({ children }: PropsWithChildren) => (
  <RdvServicePublicLayout>{children}</RdvServicePublicLayout>
)

export default Layout
