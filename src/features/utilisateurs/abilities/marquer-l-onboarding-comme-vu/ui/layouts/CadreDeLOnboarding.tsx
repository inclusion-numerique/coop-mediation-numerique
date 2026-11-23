import type { ReactNode } from 'react'

export const CadreDeLOnboarding = ({ children }: { children: ReactNode }) => (
  <div className="fr-layout">
    <div className="fr-layout__inner">{children}</div>
  </div>
)
