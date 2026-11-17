import MesBeneficiairesListeLayout from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/components/MesBeneficiairesListeLayout'
import type { PropsWithChildren } from 'react'

const MesBeneficiairesLayout = ({ children }: PropsWithChildren) => (
  <MesBeneficiairesListeLayout>{children}</MesBeneficiairesListeLayout>
)

export default MesBeneficiairesLayout
