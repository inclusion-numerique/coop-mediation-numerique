import type { ReactNode } from 'react'

export const CoopAvecMenuLayout = ({
  entete,
  menu,
  modales,
  piedDePage,
  children,
}: {
  entete: ReactNode
  menu: ReactNode
  modales: ReactNode
  piedDePage: ReactNode
  children: ReactNode
}) => (
  <>
    {entete}
    <div className="fr-flex fr-direction-column fr-direction-md-row">
      <div className="sideMenu">{menu}</div>
      <div className="fr-px-20v fr-pb-24v fr-width-full fr-flex-grow-1 fr-overflow-scroll">
        {children}
      </div>
    </div>
    {modales}
    {piedDePage}
  </>
)
