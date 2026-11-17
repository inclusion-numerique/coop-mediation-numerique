import { PropsWithChildren } from 'react'

const ConnexionLayout = ({ children }: PropsWithChildren) => (
  <div className="fr-flex fr-flex-1 fr-direction-column fr-justify-content-center fr-align-items-center fr-background-alt--blue-ecume">
    <div className="fr-container fr-container--narrow">{children}</div>
  </div>
)

export default ConnexionLayout
