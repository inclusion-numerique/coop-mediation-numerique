import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features//beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import { getMediateursLieuxActiviteOptions } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import type { DefaultValues } from 'react-hook-form'
import { getAdaptiveDureeOptions } from './db/getAdaptiveDureeOptions'
import { CraData } from './validation/CraValidation'

const craDefaultValues = (
  mediateurId: string,
  stateFromUrl: DefaultValues<CraData>,
  lieuxActiviteOptions: { value: string }[],
) => ({
  ...stateFromUrl,
  ...(stateFromUrl.structureId == null
    ? { structureId: lieuxActiviteOptions.at(0)?.value }
    : {}),
  date: stateFromUrl.date ?? new Date().toISOString().slice(0, 10),
  mediateurId: mediateurId,
  duree: stateFromUrl.duree ?? {},
})

export const getCraPageData =
  <T extends CraData>(
    craExtraDefaultValues?: (
      mediateurId: string,
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
      ...craDefaultValues(mediateurId, stateFromUrl, lieuxActiviteOptions),
      ...(craExtraDefaultValues == null
        ? {}
        : craExtraDefaultValues(mediateurId, stateFromUrl)),
    }

    const initialBeneficiairesOptions =
      await getInitialBeneficiairesOptionsForSearch({
        mediateurId,
      })

    const dureeOptions = await getAdaptiveDureeOptions({
      mediateurId,
      include: defaultValues.duree?.duree,
    })

    return {
      defaultValues,
      lieuxActiviteOptions,
      initialBeneficiairesOptions,
      dureeOptions,
    }
  }
