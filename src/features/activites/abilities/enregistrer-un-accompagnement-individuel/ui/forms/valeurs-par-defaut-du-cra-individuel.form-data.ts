import { CraIndividuelData } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/cra-individuel.validation'
import { communeDuCra } from '@/features/activites/ui/presenters/saisie/commune-du-cra.presenter'
import type { DefaultValues } from '@/libraries/formulaire/hooks'

const communeDeResidence = (
  residence?: {
    commune?: string | undefined
    codePostal?: string | undefined
    codeInsee?: string | undefined
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
