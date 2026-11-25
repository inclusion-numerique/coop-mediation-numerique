import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { estMain } from '@/configuration/projet'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { CREER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/creer-lieu-activite.key'
import CreerLieuActivitePage from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/pages/CreerLieuActivitePage'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

const LieuActiviteCreerPage = async () => {
  await authenticateMediateur(`/connexion?suivant=/lieux-activite/`)

  return (
    <ClientBinder
      bind={CREER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={creerUnLieuActiviteAction}
    >
      <CreerLieuActivitePage
        lienDePriseDeRendezVous={lienDuSiteRdv(estMain())}
      />
    </ClientBinder>
  )
}

export default LieuActiviteCreerPage
