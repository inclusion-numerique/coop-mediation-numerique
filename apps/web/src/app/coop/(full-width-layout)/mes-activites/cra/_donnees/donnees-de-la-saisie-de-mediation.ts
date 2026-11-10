import { MediateurId } from '@app/web/features/activites/domain'
import { dureesFrequentesDuMediateur } from '@app/web/features/activites/implementation/durees-frequentes'
import { optionsDeDuree } from '@app/web/features/activites/ui/saisie/options-de-duree'
import {
  type RechercherDesTagsInitiaux,
  tagDuFormulaire,
} from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import { valeursDeDepartDeMediation } from '@app/web/features/activites/ui/saisie/valeurs-de-depart'
import { CraData } from '@app/web/features/activites/ui/saisie/validation/CraValidation'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { getMediateursLieuxActiviteOptions } from '@app/web/features/lieux-activite'
import type { DefaultValues } from 'react-hook-form'

export const getCraPageData =
  <T extends CraData>(
    craExtraDefaultValues?: (
      stateFromUrl: DefaultValues<CraData>,
    ) => DefaultValues<T>,
  ) =>
  async (
    mediateurId: string,
    stateFromUrl: DefaultValues<CraData>,
    rechercherDesTagsInitiaux: RechercherDesTagsInitiaux,
  ) => {
    const lieuxActiviteOptions = await getMediateursLieuxActiviteOptions({
      mediateurIds: [mediateurId],
    })

    const defaultValues: DefaultValues<CraData> & {
      mediateurId: string
    } = {
      ...valeursDeDepartDeMediation(
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
      await rechercherDesTagsInitiaux(
        (defaultValues.tags ?? [])
          .map((tag) => tag?.id)
          .filter((id): id is string => id != null),
      )
    ).map(tagDuFormulaire)

    const dureeOptions = optionsDeDuree({
      dureesFrequentes: await dureesFrequentesDuMediateur(
        MediateurId(mediateurId),
      ),
      incluse: defaultValues.duree?.duree,
    })

    return {
      defaultValues,
      lieuxActiviteOptions,
      initialBeneficiairesOptions,
      initialTagsOptions,
      dureeOptions,
    }
  }
