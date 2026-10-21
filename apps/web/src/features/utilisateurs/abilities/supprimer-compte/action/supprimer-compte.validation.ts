import { z } from 'zod'

export const SupprimerCompteValidation = z.object({
  utilisateurId: z.guid(),
})

export type SupprimerCompteInput = z.infer<typeof SupprimerCompteValidation>
