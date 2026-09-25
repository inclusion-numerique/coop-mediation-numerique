import { z } from 'zod'

export const RetirerUnMediateurDuLieuValidation = z.object({
  mediateurId: z.guid(),
  lieuId: z.guid(),
})

export type RetirerUnMediateurDuLieuSaisie = z.infer<
  typeof RetirerUnMediateurDuLieuValidation
>
