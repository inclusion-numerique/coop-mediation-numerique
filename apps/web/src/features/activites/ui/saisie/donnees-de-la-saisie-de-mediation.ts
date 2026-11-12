import type { DefaultValues } from 'react-hook-form'
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
    const defaultValues: DefaultValues<CraData> & { mediateurId: string } = {
      ...valeursDeDepartDeMediation(mediateurId, stateFromUrl, lieuxProposes),
      ...(valeursPropres == null ? {} : valeursPropres(stateFromUrl)),
    }

    return {
      defaultValues,
      lieuxProposes,
      initialTagsOptions: (
        await tagsInitiaux(idsDesTags(defaultValues.tags))
      ).map(tagDuFormulaire),
      dureeOptions: optionsDeDuree({
        dureesFrequentes,
        incluse: defaultValues.duree?.duree,
      }),
    }
  }
