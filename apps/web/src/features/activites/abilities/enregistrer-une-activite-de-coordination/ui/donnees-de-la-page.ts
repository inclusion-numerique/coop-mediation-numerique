import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { CraAnimationData } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/animation/validation/CraAnimationValidation'
import { CraEvenementData } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/validation/CraEvenementValidation'
import { CraPartenariatData } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/partenariat/validation/CraPartenariatValidation'
import { dureeAccompagnementParDefautLabels } from '@app/web/features/activites/ui/libelles/duree-accompagnement'
import {
  type RechercherDesTagsInitiaux,
  tagDuFormulaire,
} from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import type { DefaultValues } from '@app/web/libs/form/use-app-form'

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
  duree: ('duree' in defaultValues ? defaultValues.duree : undefined) ?? {},
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
