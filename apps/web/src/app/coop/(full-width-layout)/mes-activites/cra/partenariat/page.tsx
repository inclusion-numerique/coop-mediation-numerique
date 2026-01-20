import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import CraPartenariatPage from '@app/web/features/activites/use-cases/cra/partenariat/CraPartenariatPage'
import { CraPartenariatData } from '@app/web/features/activites/use-cases/cra/partenariat/validation/CraPartenariatValidation'
import { getEquipesFromSessionUser } from '@app/web/features/activites/use-cases/tags/save/getEquipesFromSessionUser'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraPartenariatPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraPartenariatData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const user = await authenticateCoordinateur()
  const coordinateurId = user.coordinateur.id
  const equipes = getEquipesFromSessionUser(user)

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraCoordinationPageData(coordinateurId, {
    structuresPartenaires: [{}],
    ...stateFromUrl,
  })

  return (
    <CraPartenariatPage
      {...craPageData}
      coordinateurId={coordinateurId}
      equipes={equipes}
      retour={retour}
    />
  )
}

export default CreateCraPartenariatPage
