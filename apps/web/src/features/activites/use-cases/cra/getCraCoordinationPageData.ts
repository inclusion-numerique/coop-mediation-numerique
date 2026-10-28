import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { DefaultValues } from 'react-hook-form'
import { CraAnimationData } from './animation/validation/CraAnimationValidation'
import { CraEvenementData } from './evenement/validation/CraEvenementValidation'
import { dureeAccompagnementParDefautLabels } from './fields/duree-accompagnement'
import { CraPartenariatData } from './partenariat/validation/CraPartenariatValidation'
import {
  type RechercherDesTagsInitiaux,
  tagDuFormulaire,
} from './tags/tag-du-cra'

type CraCoordinationData =
  | CraAnimationData
  | CraEvenementData
  | CraPartenariatData

const craDefaultValues = (
  coordinateurId: string,
  defaultValues: DefaultValues<CraCoordinationData>,
) => ({
  ...defaultValues,
  date: defaultValues.date ?? new Date().toISOString().slice(0, 10),
  coordinateurId,
  duree: (defaultValues as CraAnimationData).duree ?? {},
  tags: defaultValues.tags ?? [],
})

export const getCraCoordinationPageData = async (
  coordinateurId: string,
  initialDefaultValues: DefaultValues<CraCoordinationData>,
  rechercherDesTagsInitiaux: RechercherDesTagsInitiaux,
) => {
  const defaultValues: DefaultValues<CraCoordinationData> & {
    coordinateurId: string
  } = craDefaultValues(coordinateurId, initialDefaultValues)

  const initialTagsOptions = (
    await rechercherDesTagsInitiaux(
      (defaultValues.tags ?? [])
        .map((tag) => tag?.id)
        .filter((id): id is string => id != null),
    )
  ).map(tagDuFormulaire)

  return {
    defaultValues,
    initialTagsOptions,
    dureeOptions: labelsToOptions(
      Object.fromEntries(Object.entries(dureeAccompagnementParDefautLabels)),
    ),
  }
}
