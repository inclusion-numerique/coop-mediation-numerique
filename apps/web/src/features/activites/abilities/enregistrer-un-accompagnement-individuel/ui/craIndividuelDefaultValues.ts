import { CraIndividuelData } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
import { communeDuCra } from '@app/web/features/activites/ui/saisie/commune/commune-du-cra'
import type { DefaultValues } from 'react-hook-form'

const communeDeResidence = (
  residence?: {
    commune?: string
    codePostal?: string
    codeInsee?: string
  } | null,
) =>
  residence?.commune && residence.codePostal && residence.codeInsee
    ? communeDuCra({
        commune: residence.commune,
        codePostal: residence.codePostal,
        codeInsee: residence.codeInsee,
      })
    : null

export const craIndividuelDefaultValues = (
  stateFromUrl: DefaultValues<CraIndividuelData>,
) => ({
  beneficiaire: {
    ...stateFromUrl.beneficiaire,
  },
  lieuCommuneData:
    stateFromUrl.lieuCommuneData ??
    communeDeResidence(stateFromUrl.beneficiaire?.communeResidence),
})
