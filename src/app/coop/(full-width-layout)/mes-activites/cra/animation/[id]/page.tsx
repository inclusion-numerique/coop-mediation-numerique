import { notFound } from 'next/navigation'
import { enregistrerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import {
  saisieDAnimation,
  saisieDeCoordinationAModifier,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/implementations/prisma/page-de-saisie.query'
import CraAnimationPage from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/animation/CraAnimationPage'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateCoordinateur } from '@/features/authentification/implementations/session/authenticate-user'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag/implementations/session/visibilites-proposees-a'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags/implementations/session/tags-initiaux-par'
import { acteurDe } from '@/features/tags/domain'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const UpdateCraAnimationPage = async ({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const user = await authenticateCoordinateur()

  const acteur = acteurDe(profilDeLaSession(user))

  const saisie = await saisieDeCoordinationAModifier(saisieDAnimation)({
    id,
    coordinateurId: user.coordinateur.id,
    fournisseurs: {
      tagsInitiaux: tagsInitiauxPar(acteur),
      visibilitesProposees: visibilitesProposeesA(acteur),
    },
  })

  if (saisie === null) return notFound()

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

export default UpdateCraAnimationPage
