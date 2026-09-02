import { z } from 'zod'

export const RetirerUnMediateurDuLieuValidation = z.object({
  mediateurId: z.string().uuid(),
  lieuId: z.string().uuid(),
})

export type RetirerUnMediateurDuLieuSaisie = z.infer<
  typeof RetirerUnMediateurDuLieuValidation
>
