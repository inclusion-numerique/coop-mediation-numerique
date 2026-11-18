import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import { authenticateMediateur } from '@/auth/authenticateUser'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import CreerLieuActivitePage from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/CreerLieuActivitePage'
import { contentId } from '@/utils/skipLinks'

const LieuActiviteCreerPage = async () => {
  await authenticateMediateur(`/connexion?suivant=/lieux-activite/`)

  return (
    <>
      <SkipLinksPortal />
      <main id={contentId}>
        <CreerLieuActivitePage
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
