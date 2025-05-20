import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import CraCollectifPage from '@app/web/features/activites/use-cases/cra/collectif/CraCollectifPage'
import { craCollectifDefaultValues } from '@app/web/features/activites/use-cases/cra/collectif/craCollectifDefaultValues'
import type { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { getCraPageData } from '@app/web/features/activites/use-cases/cra/getCraPageData'
import {
  type EncodedState,
  decodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraCollectifPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraCollectifData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const {
    mediateur: { id: mediateurId },
  } = await authenticateMediateur()

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraPageData<CraCollectifData>(
    craCollectifDefaultValues,
  )(mediateurId, stateFromUrl)

  return (
    <CraCollectifPage
      {...craPageData}
      mediateurId={mediateurId}
      retour={retour}
    />
  )
}

export default CreateCraCollectifPage
