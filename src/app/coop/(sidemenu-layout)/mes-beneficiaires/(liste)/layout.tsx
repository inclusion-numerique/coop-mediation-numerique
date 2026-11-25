import type { PropsWithChildren } from 'react'
import MesBeneficiairesListeLayout from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/layouts/MesBeneficiairesListeLayout'

const MesBeneficiairesLayout = ({ children }: PropsWithChildren) => (
  <MesBeneficiairesListeLayout>{children}</MesBeneficiairesListeLayout>
)

export default MesBeneficiairesLayout
