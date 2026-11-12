import type { DefaultValues } from '@app/web/libs/form/use-app-form'
import type { LieuDuCra } from './lieu/lieu-du-cra'
import { optionsDeDuree } from './options-de-duree'
import {
  type RechercherDesTagsInitiaux,
  tagDuFormulaire,
} from './tags/tag-du-cra'
import { valeursDeDepartDeMediation } from './valeurs-de-depart'
import type { CraData } from './validation/CraValidation'

const idsDesTags = (
  tags: DefaultValues<CraData>['tags'] = [],
): readonly string[] =>
  tags.map((tag) => tag?.id).filter((id): id is string => id != null)

export const donneesDeLaSaisieDeMediation =
  <T extends CraData>(
    valeursPropres?: (stateFromUrl: DefaultValues<CraData>) => DefaultValues<T>,
  ) =>
  async ({
    mediateurId,
    stateFromUrl,
    lieuxProposes,
    dureesFrequentes,
    tagsInitiaux,
  }: {
    mediateurId: string
    stateFromUrl: DefaultValues<CraData>
    lieuxProposes: readonly LieuDuCra[]
    dureesFrequentes: readonly number[]
    tagsInitiaux: RechercherDesTagsInitiaux
  }) => {
    const depart = valeursDeDepartDeMediation(
      mediateurId,
      stateFromUrl,
      lieuxProposes,
    )
    const defaultValues = {
      ...depart,
      ...(valeursPropres == null ? {} : valeursPropres(stateFromUrl)),
    }

    return {
      defaultValues,
      lieuxProposes,
      initialTagsOptions: (await tagsInitiaux(idsDesTags(depart.tags))).map(
        tagDuFormulaire,
      ),
      dureeOptions: optionsDeDuree({
        dureesFrequentes,
        incluse: depart.duree?.duree,
      }),
    }
  }
