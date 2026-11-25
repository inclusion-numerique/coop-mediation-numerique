import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { CREER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/creer-lieu-activite/action/creer-lieu-activite.key'
import CreerLieuActivitePage from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/pages/CreerLieuActivitePage'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

const LieuActiviteCreerPage = async () => {
  await authenticateMediateur(`/connexion?suivant=/lieux-activite/`)

  return (
    <ClientBinder
      bind={CREER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={creerUnLieuActiviteAction}
    >
      <CreerLieuActivitePage lienDePriseDeRendezVous={rdvWebsiteLink} />
    </ClientBinder>
  )
}

export default LieuActiviteCreerPage
