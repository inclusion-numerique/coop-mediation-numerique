import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import CraEvenementPage from '@app/web/features/activites/use-cases/cra/evenement/CraEvenementPage'
import { CraEvenementData } from '@app/web/features/activites/use-cases/cra/evenement/validation/CraEvenementValidation'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraEvenementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraEvenementData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const {
    coordinateur: { id: coordinateurId },
  } = await authenticateCoordinateur()

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = {
    coordinateurId,
    ...stateFromUrl, // todo: validate
    defaultValues: {
      participants: 1,
      tags: [],
    },
    initialTagsOptions: [],
  }

  return (
    <CraEvenementPage
      {...craPageData}
      coordinateurId={coordinateurId}
      retour={retour}
    />
  )
}

export default CreateCraEvenementPage
