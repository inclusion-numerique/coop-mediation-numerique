import { enregistrerUneActiviteDeCoordinationAction } from '@app/web/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@app/web/app/_actions/tags/rechercher-des-tags.action'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import {
  tagsInitiauxDuCra,
  visibilitesDeTagDuCra,
} from '@app/web/composition/activites/tags-du-cra'
import { lireUneActiviteDeCoordination } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import CraAnimationPage from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/animation/CraAnimationPage'
import { formulaireDeLAnimation } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/formulaire-de-la-coordination.presenter'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '@app/web/features/activites/domain'
import { CREER_UN_TAG_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

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
  const coordinateurId = user.coordinateur.id

  const activiteId = ActiviteDeCoordinationId.safe(id)
  const activite =
    activiteId === null
      ? null
      : await lireUneActiviteDeCoordination({
          id: activiteId,
          coordinateurId: CoordinateurId(coordinateurId),
        })

  if (activite?._tag !== 'Animation') return notFound()

  const defaultValues = formulaireDeLAnimation(activite)

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    defaultValues,
    tagsInitiauxDuCra(user),
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
          <CraAnimationPage
            {...craPageData}
            coordinateurId={coordinateurId}
            visibilitesDeTag={visibilitesDeTagDuCra(user, {
              departemental: true,
            })}
            retour={retour}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default UpdateCraAnimationPage
