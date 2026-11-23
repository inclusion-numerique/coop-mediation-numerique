import { PropsWithChildren } from 'react'
import { CadreDeConnexion } from '@/features/authentification/ui/layouts/CadreDeConnexion'

const ConnexionLayout = ({ children }: PropsWithChildren) => (
  <CadreDeConnexion>{children}</CadreDeConnexion>
)

export default ConnexionLayout
