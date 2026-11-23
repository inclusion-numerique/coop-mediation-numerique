import z from 'zod'
import { autonomieValues } from '@/features/activites/ui/libelles/autonomie.labels'
import { structuresRedirectionValues } from '@/features/activites/ui/libelles/structures-redirection.labels'
import { BeneficiaireCraValidation } from '@/features/activites/ui/saisie/validation/beneficiaire-du-cra.validation'
import { CraValidation } from '@/features/activites/ui/saisie/validation/cra.validation'
import { yesOrNo } from '@/libraries/ui/components/Form/utils/yesNoBooleanOptions'

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
