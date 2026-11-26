import { z } from 'zod'

export const StructureEmployeuseLieuValidation = z.object({
  estLieuActivite: z.boolean(),
})
