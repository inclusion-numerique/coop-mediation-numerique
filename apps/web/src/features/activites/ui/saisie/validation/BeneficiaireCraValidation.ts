import {
  GENRES,
  STATUTS_SOCIAUX,
  TRANCHES_D_AGE,
} from '@app/web/features/activites/domain'
import { CommuneDuCraValidation } from '@app/web/features/activites/ui/saisie/commune/commune-du-cra'
import { z } from 'zod'

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
