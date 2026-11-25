import type { ReactNode } from 'react'

export const OnboardingLayout = ({ children }: { children: ReactNode }) => (
  <div className="fr-layout">
    <div className="fr-layout__inner">{children}</div>
  </div>
)
