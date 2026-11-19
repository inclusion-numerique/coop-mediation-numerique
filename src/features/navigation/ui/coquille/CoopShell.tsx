import type { PropsWithChildren, ReactNode } from 'react'
import Header from '../en-tete/Header'
import PublicFooter from '../pied-de-page/PublicFooter'
import type { UtilisateurDeLaNavigation } from '../utilisateur-de-la-navigation'

type Cadre =
  | { readonly cadre: 'etape'; readonly user: UtilisateurDeLaNavigation }
  | { readonly cadre: 'application'; readonly banniere: ReactNode }

export const CoopShell = (props: PropsWithChildren<Cadre>) => (
  <div className="fr-layout">
    <div id="skip-links" />
    {props.cadre === 'etape' ? (
      <>
        <Header user={props.user} fullWidth variant="coop" />
        {props.children}
        <PublicFooter />
      </>
    ) : (
      <>
        {props.banniere}
        {props.children}
      </>
    )}
  </div>
)
