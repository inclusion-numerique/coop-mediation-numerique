import type { ReactNode } from 'react'

export const AdministrationLayout = ({
  entete,
  menu,
  piedDePage,
  children,
}: {
  entete: ReactNode
  menu: ReactNode
  piedDePage: ReactNode
  children: ReactNode
}) => (
  <>
    <div id="skip-links" />
    {entete}
    <div className="fr-flex fr-direction-column fr-direction-md-row">
      <div className="sideMenu">{menu}</div>
      <div className="fr-p-8v fr-pb-24v fr-width-full fr-flex-grow-1 fr-overflow-scroll">
        {children}
      </div>
    </div>
    {piedDePage}
  </>
)
