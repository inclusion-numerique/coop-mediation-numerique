import { enregistrerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import type { CraAnimationData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-animation.validation'
import CraAnimationPage from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/pages/CraAnimationPage'
import {
  nouvelleSaisieDeCoordination,
  saisieDAnimation,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters/page-de-saisie.presenter'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/action/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateCoordinateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { visibilitesProposees } from '@/features/tags/abilities/creer-un-tag/ui/presenters/visibilites.presenter'
import { tagsInitiauxAvec } from '@/features/tags/abilities/rechercher-des-tags/implementations/session/tags-initiaux-par.query'
import { acteurDe } from '@/features/tags/domain'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import type { EncodedState } from '@/libraries/etat-encode/encodeSerializableState'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const CreateCraAnimationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraAnimationData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const user = await authenticateCoordinateur()

  const acteur = acteurDe(profilDeLaSession(user))

  const saisie = await nouvelleSaisieDeCoordination(saisieDAnimation)({
    coordinateurId: user.coordinateur.id,
    v,
    fournisseurs: {
      tagsInitiaux: tagsInitiauxAvec(tagAffiche)(acteur),
      visibilitesProposees: visibilitesProposees(acteur),
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
          <CraAnimationPage {...saisie} retour={retour} />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraAnimationPage
