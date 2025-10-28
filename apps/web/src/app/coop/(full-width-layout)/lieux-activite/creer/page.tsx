import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import { CreerLieuActivitePageContent } from './_components/CreerLieuActivitePageContent'

const LieuActiviteCreerPage = async () => {
  await authenticateMediateur(`/connexion?suivant=/lieux-activite/`)

  return (
    <>
      <SkipLinksPortal />
      <main id={contentId}>
        <CreerLieuActivitePageContent
          contentTop={
            <CoopBreadcrumbs
              parents={[
                {
                  label: `Mes lieux d'activités`,
                  linkProps: { href: '/coop/lieux-activite/' },
                },
              ]}
              currentPage="Créer un lieu d'activité"
            />
          }
        />
      </main>
    </>
  )
}

export default LieuActiviteCreerPage
