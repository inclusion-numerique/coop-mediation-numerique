import type { Route } from 'next'
import type { PropsWithChildren, ReactNode } from 'react'
import type { UtilisateurDeLaNavigation } from '../components/en-tete/HeaderUserMenu'
import Header from '../slots/Header.slot'
import PublicFooter from '../slots/PublicFooter.slot'

type Cadre =
  | {
      readonly cadre: 'etape'
      readonly user: UtilisateurDeLaNavigation
      readonly accueil: Route
      readonly terminerUsurpation: ReactNode
    }
  | { readonly cadre: 'application'; readonly banniere: ReactNode }

export const CoopShellLayout = (props: PropsWithChildren<Cadre>) => (
  <div className="fr-layout">
    <div id="skip-links" />
    {props.cadre === 'etape' ? (
      <>
        <Header
          user={props.user}
          accueil={props.accueil}
          terminerUsurpation={props.terminerUsurpation}
          fullWidth
          variant="coop"
        />
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
