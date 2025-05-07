import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import type { DefaultValues } from 'react-hook-form'
import { CraIndividuelData } from './validation/CraIndividuelValidation'

export const craIndividuelDefaultValues = (
  mediateurId: string,
  stateFromUrl: DefaultValues<CraIndividuelData>,
) => ({
  beneficiaire: {
    mediateurId,
    ...stateFromUrl.beneficiaire,
  },
  lieuCommuneData:
    stateFromUrl.lieuCommuneData ??
    (stateFromUrl.beneficiaire?.communeResidence
      ? banDefaultValueToAdresseBanData(
          stateFromUrl.beneficiaire.communeResidence,
        )
      : null),
})
