import { z } from 'zod'

/**
 * L'administrateur désigne le compte à supprimer ; le titulaire, lui, n'a rien à
 * fournir — son identifiant vient de la session, jamais de l'input. C'est ce qui
 * remplace la garde d'appartenance que portait la procédure tRPC.
 */
export const SupprimerCompteValidation = z.object({
  utilisateurId: z.string().uuid(),
})

export type SupprimerCompteInput = z.infer<typeof SupprimerCompteValidation>
