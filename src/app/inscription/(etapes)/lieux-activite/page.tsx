import { redirect } from 'next/navigation'
import { renseignerLieuxActiviteAction } from '@/app/_actions/inscription/renseigner-lieux-activite.action'
import { rechercherDesLieuxAAjouterAction } from '@/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import type { LieuActiviteConnu } from '@/features/inscription/abilities/renseigner-lieux-activite'
import { RENSEIGNER_LIEUX_ACTIVITE_ACTION_KEY } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.key'
import LieuxActivitePage from '@/features/inscription/abilities/renseigner-lieux-activite/ui/pages/LieuxActivitePage'
import { RECHERCHER_DES_LIEUX_A_AJOUTER_KEY } from '@/features/inscription/abilities/renseigner-lieux-activite/ui/rechercher-des-lieux-a-ajouter.key'
import {
  listerLesLieuxPourLInscription,
  MediateurId,
} from '@/features/lieux-activite'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner vos lieux d’activité'),
}

const LieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  // Les lieux déjà rattachés, projetés vers l'input du formulaire. Ils portent
  // tous un id — c'est lui qui porte la réconciliation, et c'est lui qui les
  // dispense d'une adresse validée : rien ne sera réécrit de la leur.
  const lieuxActivite = await listerLesLieuxPourLInscription({
    mediateurId: MediateurId(user.mediateur.id),
  })

  const lieuxExistants: LieuActiviteConnu[] = lieuxActivite.map((lieu) => ({
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
        bind={RENSEIGNER_LIEUX_ACTIVITE_ACTION_KEY}
        to={renseignerLieuxActiviteAction}
      >
        <ClientBinder
          bind={RECHERCHER_DES_LIEUX_A_AJOUTER_KEY}
          to={rechercherDesLieuxAAjouterAction}
        >
          <LieuxActivitePage lieuxActivite={lieuxExistants} />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default LieuxActivitePageRoute
