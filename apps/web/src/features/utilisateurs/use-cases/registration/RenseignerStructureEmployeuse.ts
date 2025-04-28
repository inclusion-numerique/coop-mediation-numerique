import { StructureCreationValidationWithSiret } from '@app/web/features/structures/StructureValidation'
import z from 'zod'

export const RenseignerStructureEmployeuseValidation = z.object({
  userId: z.string().uuid(),
  structureEmployeuse: StructureCreationValidationWithSiret,
  conseillerNumeriqueId: z.string().nullish(),
})

export type RenseignerStructureEmployeuseData = z.infer<
  typeof RenseignerStructureEmployeuseValidation
>
