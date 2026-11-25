import { redirect } from 'next/navigation'
import { ajouterDesLieuxActiviteAction } from '@/app/_actions/lieux-activite/ajouter-des-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { rechercherDesLieuxAAjouterAction } from '@/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import { estMain } from '@/configuration/projet'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.key'
import { CREER_UN_LIEU_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/creer-un-lieu.key'
import { RECHERCHER_DES_LIEUX_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/rechercher-des-lieux.key'
import { AjouterDesLieuxPage } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages/AjouterDesLieuxPage'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

const AjouterLieuPage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    return redirect('/')
  }

  return (
    <ClientBinder
      bind={AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY}
      to={ajouterDesLieuxActiviteAction}
    >
      <ClientBinder bind={CREER_UN_LIEU_KEY} to={creerUnLieuActiviteAction}>
        <ClientBinder
          bind={RECHERCHER_DES_LIEUX_KEY}
          to={rechercherDesLieuxAAjouterAction}
        >
          <AjouterDesLieuxPage
            retourHref="/coop/lieux-activite"
            lienDePriseDeRendezVous={lienDuSiteRdv(estMain())}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default AjouterLieuPage
