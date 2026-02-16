import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { StructureValidation } from '@app/web/features/structures/StructureValidation'
import { requiredSiretValidation } from '@app/web/features/structures/siret/siretValidation'
import z from 'zod'

export const StructureEmployeuseValidation = StructureValidation.extend({
  nom: z.string().min(1, 'Le nom est requis'),
  adresseBan: AdresseBanValidation,
  siret: requiredSiretValidation,
})

export type StructureEmployeuseData = z.infer<
  typeof StructureEmployeuseValidation
>

export const RenseignerStructureEmployeuseValidation = z.object({
  userId: z.string().uuid(),
  structureEmployeuse: StructureEmployeuseValidation,
  conseillerNumeriqueId: z.string().nullish(),
})

export type RenseignerStructureEmployeuseData = z.infer<
  typeof RenseignerStructureEmployeuseValidation
>
