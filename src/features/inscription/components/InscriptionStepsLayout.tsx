import { PropsWithChildren } from 'react'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import { contentId } from '@/utils/skipLinks'

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
