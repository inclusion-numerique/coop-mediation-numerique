import { BeneficiaireValidation } from '@app/web/features/beneficiaire/forms/beneficiaire-validation'
import { z } from 'zod'

export const BeneficiaireCraValidation = BeneficiaireValidation.omit({
  prenom: true,
  nom: true,
  telephone: true,
  email: true,
  anneeNaissance: true,
}).extend({
  prenom: z.string().nullish(),
  nom: z.string().nullish(),
  telephone: z.string().nullish(),
  email: z.string().nullish(),
  anneeNaissance: z.number().nullish(),
})

export type BeneficiaireCraData = z.infer<typeof BeneficiaireCraValidation>
