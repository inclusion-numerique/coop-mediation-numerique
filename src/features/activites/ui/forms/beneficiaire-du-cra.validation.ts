import { z } from 'zod'
import {
  GENRES,
  STATUTS_SOCIAUX,
  TRANCHES_D_AGE,
} from '@/features/activites/domain'
import { CommuneDuCraValidation } from '@/features/activites/ui/forms/commune-du-cra.validation'

export const BeneficiaireCraValidation = z.object({
  id: z.guid().nullish(),
  prenom: z.string().nullish(),
  nom: z.string().nullish(),
  dejaAccompagne: z.boolean().nullish(),
  communeResidence: CommuneDuCraValidation.nullish(),
  genre: z.enum(GENRES).nullish(),
  trancheAge: z.enum(TRANCHES_D_AGE).nullish(),
  statutSocial: z.enum(STATUTS_SOCIAUX).nullish(),
})

export type BeneficiaireCraData = z.infer<typeof BeneficiaireCraValidation>
