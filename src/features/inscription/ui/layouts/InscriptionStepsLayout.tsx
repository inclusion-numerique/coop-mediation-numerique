import { PropsWithChildren } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'

const InscriptionStepsLayout = ({ children }: PropsWithChildren) => (
  <>
    <SkipLinksPortal />
    <main
      id={contentId}
      className="fr-layout__main fr-background-alt--blue-france"
    >
      <div className="fr-container fr-container--narrow">{children}</div>
    </main>
  </>
)

export default InscriptionStepsLayout
