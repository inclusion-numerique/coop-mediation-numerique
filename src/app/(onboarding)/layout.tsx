import { PropsWithChildren } from 'react'
import { marquerLOnboardingCommeVuAction } from '@/app/_actions/utilisateurs/marquer-l-onboarding-comme-vu.action'
import { MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/action/marquer-l-onboarding-comme-vu.key'
import { CadreDeLOnboarding } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/ui/layouts/CadreDeLOnboarding'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const OnboardingLayout = ({ children }: PropsWithChildren) => (
  <CadreDeLOnboarding>
    <ClientBinder
      bind={MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY}
      to={marquerLOnboardingCommeVuAction}
    >
      {children}
    </ClientBinder>
  </CadreDeLOnboarding>
)

export default OnboardingLayout
