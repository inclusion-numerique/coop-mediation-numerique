import type { Route } from 'next'
import type { PropsWithChildren, ReactNode } from 'react'
import PublicFooter from '../components/PublicFooter'
import Header from '../slots/Header.slot'

type CoordinationDuMediateur = {
  readonly coordinateur: {
    readonly id: string
    readonly user: { readonly name: string | null }
    readonly mediateursCoordonnes: readonly { readonly mediateurId: string }[]
  }
}

export type UtilisateurDeLaNavigation = {
  readonly role: 'User' | 'Admin'
  readonly inscriptionValidee: string | null
  readonly name: string | null
  readonly email: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly usurper: { readonly id: string } | null
  readonly emplois: readonly {
    readonly structure: { readonly nom: string | null }
  }[]
  readonly coordinateur: { readonly id: string } | null
  readonly mediateur: {
    readonly id: string
    readonly _count: { readonly enActivite: number }
    readonly coordinations: readonly CoordinationDuMediateur[]
  } | null
}

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
