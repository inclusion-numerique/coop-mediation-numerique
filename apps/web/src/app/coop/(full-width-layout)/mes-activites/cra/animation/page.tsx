import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import CraAnimationPage from '@app/web/features/activites/use-cases/cra/animation/CraAnimationPage'
import { CraAnimationData } from '@app/web/features/activites/use-cases/cra/animation/validation/CraAnimationValidation'
import { dureeAccompagnementParDefautLabels } from '@app/web/features/activites/use-cases/cra/fields/duree-accompagnement'
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

  const {
    coordinateur: { id: coordinateurId },
  } = await authenticateCoordinateur()

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = {
    coordinateurId,
    ...stateFromUrl, // todo: validate
    defaultValues: {
      tags: [],
      duree: {},
    },
    initialTagsOptions: [],
    dureeOptions: labelsToOptions(
      Object.fromEntries(Object.entries(dureeAccompagnementParDefautLabels)),
    ),
  }

  return (
    <CraAnimationPage
      {...craPageData}
      coordinateurId={coordinateurId}
      retour={retour}
    />
  )
}

export default CreateCraAnimationPage
