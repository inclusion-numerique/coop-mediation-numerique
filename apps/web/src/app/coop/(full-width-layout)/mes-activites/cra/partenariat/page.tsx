import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import CraPartenariatPage from '@app/web/features/activites/use-cases/cra/partenariat/CraPartenariatPage'
import { CraPartenariatData } from '@app/web/features/activites/use-cases/cra/partenariat/validation/CraPartenariatValidation'
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

  const {
    coordinateur: { id: coordinateurId },
  } = await authenticateCoordinateur()

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = {
    coordinateurId,
    ...stateFromUrl, // todo: validate
    defaultValues: {
      structuresPartenaires: [{ nom: undefined, type: undefined }],
      tags: [],
    },
    initialTagsOptions: [],
  }

  return (
    <CraPartenariatPage
      {...craPageData}
      coordinateurId={coordinateurId}
      retour={retour}
    />
  )
}

export default CreateCraPartenariatPage
