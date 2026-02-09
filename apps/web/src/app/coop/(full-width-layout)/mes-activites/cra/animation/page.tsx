import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import CraAnimationPage from '@app/web/features/activites/use-cases/cra/animation/CraAnimationPage'
import { CraAnimationData } from '@app/web/features/activites/use-cases/cra/animation/validation/CraAnimationValidation'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import { getEquipesFromSessionUser } from '@app/web/features/activites/use-cases/tags/equipe'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

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
  const coordinateurId = user.coordinateur.id
  const equipes = getEquipesFromSessionUser(user)

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    stateFromUrl,
  )

  return (
    <CraAnimationPage
      {...craPageData}
      coordinateurId={coordinateurId}
      equipes={equipes}
      retour={retour}
    />
  )
}

export default CreateCraAnimationPage
