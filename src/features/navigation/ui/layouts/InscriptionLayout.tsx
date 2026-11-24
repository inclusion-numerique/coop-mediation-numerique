import type { ReactNode } from 'react'

export const InscriptionLayout = ({
  entete,
  piedDePage,
  children,
}: {
  entete: ReactNode
  piedDePage: ReactNode
  children: ReactNode
}) => (
  <div className="fr-layout">
    <div className="fr-layout__inner">
      <div id="skip-links" />
      {entete}
      {children}
      {piedDePage}
    </div>
  </div>
)
