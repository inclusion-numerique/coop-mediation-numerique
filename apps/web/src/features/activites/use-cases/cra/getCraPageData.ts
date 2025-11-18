import { searchTags } from '@app/web/features/activites/use-cases/tags/search/searchTags'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import { getMediateursLieuxActiviteOptions } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import type { DefaultValues } from 'react-hook-form'
import { getAdaptiveDureeOptions } from './db/getAdaptiveDureeOptions'
import { CraData } from './validation/CraValidation'

const craDefaultValues = (
  mediateurId: string,
  stateFromUrl: DefaultValues<CraData>,
  lieuxActiviteOptions: {
    value: string
    extra?: { nom: string; adresse: string }
  }[],
) => ({
  ...stateFromUrl,
  ...(stateFromUrl.structure?.id == null
    ? {
        structure: {
          id: lieuxActiviteOptions.at(0)?.value,
          ...lieuxActiviteOptions.at(0)?.extra,
        },
      }
    : {}),
  date: stateFromUrl.date ?? new Date().toISOString().slice(0, 10),
  mediateurId: mediateurId,
  duree: stateFromUrl.duree ?? {},
  tags: stateFromUrl.tags ?? [],
})

export const getCraPageData =
  <T extends CraData>(
    craExtraDefaultValues?: (
      stateFromUrl: DefaultValues<CraData>,
    ) => DefaultValues<T>,
  ) =>
  async (mediateurId: string, stateFromUrl: DefaultValues<CraData>) => {
    const lieuxActiviteOptions = await getMediateursLieuxActiviteOptions({
      mediateurIds: [mediateurId],
    })

    const defaultValues: DefaultValues<CraData> & {
      mediateurId: string
    } = {
      ...craDefaultValues(
        mediateurId,
        stateFromUrl,
        lieuxActiviteOptions ?? [],
      ),
      ...(craExtraDefaultValues == null
        ? {}
        : craExtraDefaultValues(stateFromUrl)),
    }

    const initialBeneficiairesOptions =
      await getInitialBeneficiairesOptionsForSearch({
        mediateurId,
      })

    const initialTagsOptions = (
      await searchTags({
        searchParams: { lignes: '10' },
        excludeIds: defaultValues.tags
          ?.map((tag) => tag?.id)
          .filter((id): id is string => id != null),
      })
    ).items

    const dureeOptions = await getAdaptiveDureeOptions({
      mediateurId,
      include: defaultValues.duree?.duree,
    })

    return {
      defaultValues,
      lieuxActiviteOptions,
      initialBeneficiairesOptions,
      initialTagsOptions,
      dureeOptions,
    }
  }
