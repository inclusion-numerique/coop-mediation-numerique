import { BeneficiaireCraValidation } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { yesOrNo } from '@app/web/utils/yesNoBooleanOptions'
import z from 'zod'
import { CraValidation } from '../../validation/CraValidation'
import { autonomieValues } from '../fields/autonomie'
import { structuresRedirectionValues } from '../fields/structures-redirection'

export const CraIndividuelValidation = CraValidation.extend({
  beneficiaire: BeneficiaireCraValidation.nullish(),
  autonomie: z.enum(autonomieValues).nullish(),
  orienteVersStructure: z.enum(yesOrNo).nullish(),
  structureDeRedirection: z.enum(structuresRedirectionValues).nullish(),
})
  // structure is required if typeLieu ===  LieuActivite
  .refine(
    (data) => {
      return data.typeLieu === 'LieuActivite'
        ? data.structure?.id != null
        : true
    },
    {
      message: 'Veuillez renseigner le lieu d’activité',
      path: ['structure'],
    },
  )
  // lieuCommuneData is required if typeLieu === Domicile ou typeLieu === Autre
  .refine(
    (data) =>
      (data.typeLieu !== 'Autre' && data.typeLieu !== 'Domicile') ||
      !!data.lieuCommuneData,
    {
      message: 'Veuillez renseigner la commune',
      path: ['lieuCommuneData'],
    },
  )

export type CraIndividuelData = z.infer<typeof CraIndividuelValidation>
