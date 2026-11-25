import type { ReactNode } from 'react'

export const CoopPleineLargeurLayout = ({
  entete,
  modales,
  piedDePage,
  children,
}: {
  entete: ReactNode
  modales: ReactNode
  piedDePage: ReactNode
  children: ReactNode
}) => (
  <div className="fr-layout__inner">
    {entete}
    <div className="fr-layout__main">{children}</div>
    {modales}
    {piedDePage}
  </div>
)
