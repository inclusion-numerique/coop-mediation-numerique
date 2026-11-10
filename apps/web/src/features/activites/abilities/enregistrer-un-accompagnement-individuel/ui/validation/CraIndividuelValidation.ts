import { autonomieValues } from '@app/web/features/activites/ui/libelles/autonomie'
import { structuresRedirectionValues } from '@app/web/features/activites/ui/libelles/structures-redirection'
import { BeneficiaireCraValidation } from '@app/web/features/activites/ui/saisie/validation/BeneficiaireCraValidation'
import { CraValidation } from '@app/web/features/activites/ui/saisie/validation/CraValidation'
import { yesOrNo } from '@app/web/utils/yesNoBooleanOptions'
import z from 'zod'

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
