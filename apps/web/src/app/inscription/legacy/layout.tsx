import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import React, { PropsWithChildren } from 'react'

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
