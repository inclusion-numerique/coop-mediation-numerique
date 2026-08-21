import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getCraPageData } from '@app/web/features/activites/use-cases/cra/getCraPageData'
import CraIndividuelPage from '@app/web/features/activites/use-cases/cra/individuel/CraIndividuelPage'
import { craIndividuelDefaultValues } from '@app/web/features/activites/use-cases/cra/individuel/craIndividuelDefaultValues'
import { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import { getEquipesFromSessionUser } from '@app/web/features/activites/use-cases/tags/equipe'
import RattacherEmployeusePage from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraIndividuelPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id
  const equipes = getEquipesFromSessionUser(user)

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

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraPageData<CraIndividuelData>(
    craIndividuelDefaultValues,
  )(mediateurId, stateFromUrl)

  return (
    <CraIndividuelPage
      {...craPageData}
      mediateurId={mediateurId}
      equipes={equipes}
      retour={retour}
    />
  )
}

export default CreateCraIndividuelPage
