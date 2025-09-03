import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getCraPageData } from '@app/web/features/activites/use-cases/cra/getCraPageData'
import CraIndividuelPage from '@app/web/features/activites/use-cases/cra/individuel/CraIndividuelPage'
import { craIndividuelDefaultValues } from '@app/web/features/activites/use-cases/cra/individuel/craIndividuelDefaultValues'
import { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
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

  const {
    mediateur: { id: mediateurId },
  } = await authenticateMediateur()

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraPageData<CraIndividuelData>(
    craIndividuelDefaultValues,
  )(mediateurId, stateFromUrl)

  return (
    <CraIndividuelPage
      {...craPageData}
      mediateurId={mediateurId}
      retour={retour}
    />
  )
}

export default CreateCraIndividuelPage
