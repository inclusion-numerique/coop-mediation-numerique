import type { ReactNode } from 'react'

export const AjoutDeLieuxLayout = ({ children }: { children: ReactNode }) => (
  <div className="fr-layout__inner fr-height-full">
    <div className="fr-layout__main fr-background-alt--blue-france ">
      {children}
    </div>
  </div>
)
