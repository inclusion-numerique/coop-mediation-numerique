import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { DefaultValues } from 'react-hook-form'
import { searchTags } from '../tags/search/searchTags'
import { CraAnimationData } from './animation/validation/CraAnimationValidation'
import { CraEvenementData } from './evenement/validation/CraEvenementValidation'
import { dureeAccompagnementParDefautLabels } from './fields/duree-accompagnement'
import { CraPartenariatData } from './partenariat/validation/CraPartenariatValidation'

type CraCoordinationData =
  | CraAnimationData
  | CraEvenementData
  | CraPartenariatData

const craDefaultValues = (
  coordinateurId: string,
  stateFromUrl: DefaultValues<CraCoordinationData>,
) => ({
  ...stateFromUrl,
  date: stateFromUrl.date ?? new Date().toISOString().slice(0, 10),
  coordinateurId,
  duree: (stateFromUrl as CraAnimationData).duree ?? {},
  tags: stateFromUrl.tags ?? [],
})

export const getCraCoordinationPageData = async (
  coordinateurId: string,
  stateFromUrl: DefaultValues<CraCoordinationData>,
) => {
  const defaultValues: DefaultValues<CraCoordinationData> & {
    coordinateurId: string
  } = craDefaultValues(coordinateurId, stateFromUrl)

  const initialTagsOptions = (
    await searchTags({
      coordinateurId,
      searchParams: { lignes: '10' },
      excludeIds: defaultValues.tags
        ?.map((tag) => tag?.id)
        .filter((id): id is string => id != null),
    })
  ).items

  return {
    defaultValues,
    initialTagsOptions,
    dureeOptions: labelsToOptions(
      Object.fromEntries(Object.entries(dureeAccompagnementParDefautLabels)),
    ),
  }
}
