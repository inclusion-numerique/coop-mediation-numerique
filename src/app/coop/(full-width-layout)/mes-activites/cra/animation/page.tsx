import { enregistrerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsDuCraAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import CraAnimationPage from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/pages/CraAnimationPage'
import type { SaisieDAnimationEncodee } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters/page-de-saisie.presenter'
import {
  nouvelleSaisieDeCoordination,
  saisieDAnimation,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters/page-de-saisie.presenter'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/action/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { TAGS_PROPOSES_PAR_LE_CRA } from '@/features/activites/domain'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { visibilitesProposees } from '@/features/tags/abilities/creer-un-tag/ui/presenters/visibilites.presenter'
import { tagsInitiauxAvec } from '@/features/tags/abilities/rechercher-des-tags/implementations/prisma/tags-initiaux-par.query'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

const CreateCraAnimationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: SaisieDAnimationEncodee
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
      tagsInitiaux: tagsInitiauxAvec(
        tagAffiche,
        TAGS_PROPOSES_PAR_LE_CRA,
      )(acteur),
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
        to={rechercherDesTagsDuCraAction}
      >
        <ClientBinder bind={CREER_UN_TAG_DU_CRA_KEY} to={creerUnTagAction}>
          <CraAnimationPage {...saisie} retour={retour} />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraAnimationPage
