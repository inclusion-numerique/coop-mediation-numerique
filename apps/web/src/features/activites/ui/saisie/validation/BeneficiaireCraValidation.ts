import { CommuneDuCraValidation } from '@app/web/features/activites/ui/saisie/commune/commune-du-cra'
import { BeneficiaireValidation } from '@app/web/features/beneficiaire/forms/beneficiaire-validation'
import { z } from 'zod'

export const BeneficiaireCraValidation = BeneficiaireValidation.omit({
  prenom: true,
  nom: true,
  telephone: true,
  email: true,
  anneeNaissance: true,
  communeResidence: true,
}).extend({
  prenom: z.string().nullish(),
  nom: z.string().nullish(),
  telephone: z.string().nullish(),
  email: z.string().nullish(),
  anneeNaissance: z.number().nullish(),
  communeResidence: CommuneDuCraValidation.nullish(),
})

export type BeneficiaireCraData = z.infer<typeof BeneficiaireCraValidation>
