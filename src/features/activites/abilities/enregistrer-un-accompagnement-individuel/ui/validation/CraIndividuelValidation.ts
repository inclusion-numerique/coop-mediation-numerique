import z from 'zod'
import { autonomieValues } from '@/features/activites/ui/libelles/autonomie'
import { structuresRedirectionValues } from '@/features/activites/ui/libelles/structures-redirection'
import { BeneficiaireCraValidation } from '@/features/activites/ui/saisie/validation/BeneficiaireCraValidation'
import { CraValidation } from '@/features/activites/ui/saisie/validation/CraValidation'
import { yesOrNo } from '@/utils/yesNoBooleanOptions'

export const CraIndividuelValidation = CraValidation.extend({
  beneficiaire: BeneficiaireCraValidation.nullish(),
  autonomie: z.enum(autonomieValues).nullish(),
  orienteVersStructure: z.enum(yesOrNo).nullish(),
  structureDeRedirection: z.enum(structuresRedirectionValues).nullish(),
})
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
