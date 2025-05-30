import { StructureValidation } from '@app/web/features/structures/StructureValidation'
import z from 'zod'

export const LieuxActiviteValidation = z.object({
  userId: z.string().uuid(),
  lieuxActivite: z
    .array(StructureValidation, {
      required_error: 'Veuillez renseigner au moins un lieu d’activité',
    })
    .min(1, 'Veuillez renseigner au moins un lieu d’activité'),
  // Helper field only used in client form
  addLieuActiviteCartographieNationaleId: z.string().nullish(),
})

export type LieuxActiviteData = z.infer<typeof LieuxActiviteValidation>
