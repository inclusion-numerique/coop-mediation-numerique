import { redirect } from 'next/navigation'
import { renseignerLieuxActiviteAction } from '@/app/_actions/inscription/renseigner-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { rechercherDesLieuxAAjouterAction } from '@/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { estMain, metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import LieuxActivitePage from '@/features/inscription/abilities/renseigner-lieux-activite/ui/pages/LieuxActivitePage'
import { CREER_UN_LIEU_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/creer-un-lieu.key'
import { ENREGISTRER_LA_SELECTION_DE_LIEUX_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/enregistrer-la-selection.key'
import { RECHERCHER_DES_LIEUX_KEY } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/rechercher-des-lieux.key'
import { AjouterDesLieuxActivitePage } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages/AjouterDesLieuxActivitePage'
import { listerLesLieuxPourLInscription } from '@/features/lieux-activite/abilities/lister-les-lieux-pour-l-inscription/implementations/prisma/lister-les-lieux-pour-l-inscription.query'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner vos lieux d’activité'),
}

const LieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  const lieuxActivite = await listerLesLieuxPourLInscription({
    mediateurId: MediateurId(user.mediateur.id),
  })

  const lieuxExistants = lieuxActivite.map((lieu) => ({
    id: lieu.id ?? '',
    structureCartographieNationaleId:
      lieu.structureCartographieNationaleId ?? null,
    nom: lieu.nom,
    adresse: lieu.adresse ?? '',
    commune: lieu.commune ?? '',
    codePostal: lieu.codePostal ?? '',
    codeInsee: lieu.codeInsee ?? null,
  }))

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={ENREGISTRER_LA_SELECTION_DE_LIEUX_KEY}
        to={renseignerLieuxActiviteAction}
      >
        <ClientBinder
          bind={RECHERCHER_DES_LIEUX_KEY}
          to={rechercherDesLieuxAAjouterAction}
        >
          <ClientBinder bind={CREER_UN_LIEU_KEY} to={creerUnLieuActiviteAction}>
            <LieuxActivitePage
              formulaire={
                <AjouterDesLieuxActivitePage
                  lieuxInitiaux={lieuxExistants}
                  issue={{
                    _tag: 'Selection',
                    suivantHref: '/inscription/recapitulatif',
                  }}
                  lienDePriseDeRendezVous={lienDuSiteRdv(estMain())}
                />
              }
            />
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default LieuxActivitePageRoute
