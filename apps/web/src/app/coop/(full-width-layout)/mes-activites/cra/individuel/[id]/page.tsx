import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@app/web/app/_actions/tags/rechercher-des-tags.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import {
  tagsInitiauxDuCra,
  visibilitesDeTagDuCra,
} from '@app/web/composition/activites/tags-du-cra'
import type { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { getCraPageData } from '@app/web/features/activites/use-cases/cra/getCraPageData'
import CraIndividuelPage from '@app/web/features/activites/use-cases/cra/individuel/CraIndividuelPage'
import { getCraIndividuelDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/individuel/db/getCraIndividuelDataDefaultValuesFromExisting'
import { CREER_UN_TAG_DU_CRA_KEY } from '@app/web/features/activites/use-cases/cra/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@app/web/features/activites/use-cases/cra/tags/rechercher-des-tags.key'
import RattacherEmployeusePage from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

const UpdateCraIndividuelPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id

  // Une activité s'exerce forcément quelque part : sans employeuse, on demande
  // laquelle plutôt que d'enregistrer un CRA rattaché à personne. Le cas type
  // est la fin d'un contrat de conseiller numérique — l'Entrepôt clôt
  // l'affectation, la personne reste médiatrice.
  //
  // La garde pose EXACTEMENT la question que posera l'écriture
  // (`createOrUpdateActivite`), et non celle, plus étroite, de la session :
  // `user.emplois` ne connaît que l'affectation active, quand l'ability
  // reconnaît aussi le contrat qui couvre la date. Sans cela, les personnes que
  // seul leur contrat rattache seraient renvoyées vers ce formulaire alors que
  // leur CRA se serait rattaché sans elles.
  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const defaultValues = await getCraIndividuelDataDefaultValuesFromExisting({
    id,
    mediateurId,
  })

  if (defaultValues == null) return notFound()

  const craPageData = await getCraPageData<CraCollectifData>()(
    mediateurId,
    defaultValues,
    tagsInitiauxDuCra(user),
  )

  return (
    <ClientBinder
      bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
      to={rechercherDesTagsAction}
    >
      <ClientBinder bind={CREER_UN_TAG_DU_CRA_KEY} to={creerUnTagAction}>
        <ClientBinder
          bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
          to={rechercherUnLieuActiviteAction}
        >
          <CraIndividuelPage
            {...craPageData}
            mediateurId={mediateurId}
            visibilitesDeTag={visibilitesDeTagDuCra(user, {
              departemental: false,
            })}
            retour={retour}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default UpdateCraIndividuelPage
