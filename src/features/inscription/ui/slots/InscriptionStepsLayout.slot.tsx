import { PropsWithChildren } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'

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
