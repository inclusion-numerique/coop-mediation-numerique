import { marquerLOnboardingCommeVuAction } from '@app/web/app/_actions/utilisateurs/marquer-l-onboarding-comme-vu.action'
import { MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/action/marquer-l-onboarding-comme-vu.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { PropsWithChildren } from 'react'

const OnboardingLayout = ({ children }: PropsWithChildren) => (
  <div className="fr-layout">
    <div className="fr-layout__inner">
      <ClientBinder
        bind={MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY}
        to={marquerLOnboardingCommeVuAction}
      >
        {children}
      </ClientBinder>
    </div>
  </div>
)

export default OnboardingLayout
