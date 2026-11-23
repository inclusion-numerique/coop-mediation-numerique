import { enregistrerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import {
  nouvelleSaisieDeCoordination,
  saisieDEvenement,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import CraEvenementPage from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/CraEvenementPage'
import type { CraEvenementData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/validation/CraEvenementValidation'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateCoordinateur } from '@/features/authentification/implementations/session/authenticate-user'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags'
import { acteurDe } from '@/features/tags/domain'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'

const CreateCraEvenementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraEvenementData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const user = await authenticateCoordinateur()

  const acteur = acteurDe(profilDeLaSession(user))

  const saisie = await nouvelleSaisieDeCoordination(saisieDEvenement)({
    coordinateurId: user.coordinateur.id,
    v,
    fournisseurs: {
      tagsInitiaux: tagsInitiauxPar(acteur),
      visibilitesProposees: visibilitesProposeesA(acteur),
    },
  })

  return (
    <ClientBinder
      bind={ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY}
      to={enregistrerUneActiviteDeCoordinationAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
        to={rechercherDesTagsAction}
      >
        <ClientBinder bind={CREER_UN_TAG_DU_CRA_KEY} to={creerUnTagAction}>
          <CraEvenementPage {...saisie} retour={retour} />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraEvenementPage
