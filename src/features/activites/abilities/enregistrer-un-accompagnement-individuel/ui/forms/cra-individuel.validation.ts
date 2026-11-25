import z from 'zod'
import { BeneficiaireCraValidation } from '@/features/activites/ui/forms/beneficiaire-du-cra.validation'
import { CraValidation } from '@/features/activites/ui/forms/cra.validation'
import { autonomieValues } from '@/features/activites/ui/labels/libelles/autonomie.labels'
import { structuresRedirectionValues } from '@/features/activites/ui/labels/libelles/structures-redirection.labels'
import { yesOrNo } from '@/libraries/ui'

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
