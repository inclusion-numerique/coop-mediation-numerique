import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticateUser'
import { CREER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/creer-lieu-activite.key'
import CreerLieuActivitePage from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/CreerLieuActivitePage'
import { LIEN_DE_PRISE_DE_RENDEZ_VOUS_KEY } from '@/features/lieux-activite/ui'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/urls'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'

const LieuActiviteCreerPage = async () => {
  await authenticateMediateur(`/connexion?suivant=/lieux-activite/`)

  return (
    <ClientBinder
      bind={CREER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={creerUnLieuActiviteAction}
    >
      <ClientBinder bind={LIEN_DE_PRISE_DE_RENDEZ_VOUS_KEY} to={rdvWebsiteLink}>
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
      </ClientBinder>
    </ClientBinder>
  )
}

export default LieuActiviteCreerPage
