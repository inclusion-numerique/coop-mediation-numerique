import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { CraIndividuelData } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
import type { DefaultValues } from 'react-hook-form'

export const craIndividuelDefaultValues = (
  stateFromUrl: DefaultValues<CraIndividuelData>,
) => ({
  beneficiaire: {
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
