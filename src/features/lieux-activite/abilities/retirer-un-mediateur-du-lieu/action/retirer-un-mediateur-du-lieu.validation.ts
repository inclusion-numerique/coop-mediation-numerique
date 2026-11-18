import { z } from 'zod'

export const RetirerUnMediateurDuLieuValidation = z.object({
  mediateurId: z.guid(),
  lieuId: z.guid(),
})
