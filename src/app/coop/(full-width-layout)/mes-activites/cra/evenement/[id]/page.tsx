import { notFound } from 'next/navigation'
import { enregistrerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/enregistrer-une-activite-de-coordination.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { lireUneActiviteDeCoordination } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.key'
import { getCraCoordinationPageData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/donnees-de-la-page'
import CraEvenementPage from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/CraEvenementPage'
import { formulaireDeLEvenement } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/formulaire-de-la-coordination.presenter'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '@/features/activites/domain'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { visibilitesDuCra } from '@/features/activites/ui/saisie/tags/tag-du-cra'
import { authenticateCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const UpdateCraEvenementPage = async ({
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

  if (activite?._tag !== 'Evenement') return notFound()

  const defaultValues = formulaireDeLEvenement(activite)

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    defaultValues,
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

export default UpdateCraEvenementPage
