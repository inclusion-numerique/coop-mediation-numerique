import { PropsWithChildren } from 'react'
import { ConnexionLayout } from '@/features/authentification/ui/layouts/ConnexionLayout'

const Layout = ({ children }: PropsWithChildren) => (
  <ConnexionLayout>{children}</ConnexionLayout>
)

export default Layout
