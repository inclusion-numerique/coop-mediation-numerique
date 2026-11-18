import { enregistrerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { authenticateCoordinateur } from '@/auth/authenticateUser'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import { getCraCoordinationPageData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/donnees-de-la-page'
import CraEvenementPage from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/CraEvenementPage'
import { CraEvenementData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/validation/CraEvenementValidation'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { visibilitesDuCra } from '@/features/activites/ui/saisie/tags/tag-du-cra'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/parametres-d-url/encodeSerializableState'
import { ClientBinder } from '@/libs/injection/client-binder'

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
  const coordinateurId = user.coordinateur.id

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    stateFromUrl,
    tagsInitiauxPar(user),
  )

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
          <CraEvenementPage
            {...craPageData}
            coordinateurId={coordinateurId}
            visibilitesDeTag={visibilitesDuCra(visibilitesProposeesA(user), {
              departemental: true,
            })}
            retour={retour}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraEvenementPage
