import { z } from 'zod'

export const ReglerMaVisibiliteCartoValidation = z.object({
  visible: z.boolean(),
})

export const ReglerLaVisibiliteCartoValidation = z.object({
  mediateurId: z.guid(),
  visible: z.boolean(),
})
