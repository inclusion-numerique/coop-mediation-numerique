import type { PropsWithChildren, ReactNode } from 'react'

type Cadre =
  | {
      readonly cadre: 'etape'
      readonly entete: ReactNode
      readonly pied: ReactNode
    }
  | { readonly cadre: 'application'; readonly banniere: ReactNode }

export const CoopShellLayout = (props: PropsWithChildren<Cadre>) => (
  <div className="fr-layout">
    <div id="skip-links" />
    {props.cadre === 'etape' ? (
      <>
        {props.entete}
        {props.children}
        {props.pied}
      </>
    ) : (
      <>
        {props.banniere}
        {props.children}
      </>
    )}
  </div>
)
