import { PropsWithChildren } from 'react'
import { marquerLOnboardingCommeVuAction } from '@/app/_actions/utilisateurs/marquer-l-onboarding-comme-vu.action'
import { MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/action/marquer-l-onboarding-comme-vu.key'
import { OnboardingLayout } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/ui/layouts/OnboardingLayout'
import { ClientBinder } from '@/libraries/nextjs/injection'

const Layout = ({ children }: PropsWithChildren) => (
  <OnboardingLayout>
    <ClientBinder
      bind={MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY}
      to={marquerLOnboardingCommeVuAction}
    >
      {children}
    </ClientBinder>
  </OnboardingLayout>
)

export default Layout
