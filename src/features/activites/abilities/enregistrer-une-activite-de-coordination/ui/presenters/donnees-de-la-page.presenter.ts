import { CraAnimationData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-animation.validation'
import { CraEvenementData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-evenement.validation'
import { CraPartenariatData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-partenariat.validation'
import { dureeAccompagnementParDefautLabels } from '@/features/activites/ui/labels/libelles/duree-accompagnement.labels'
import {
  type RechercherDesTagsInitiaux,
  tagDuFormulaire,
} from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import type { DefaultValues } from '@/libraries/formulaire/hooks'
import { labelsToOptions } from '@/libraries/ui/form'

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

export const donneesDeLaPage = async (
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
