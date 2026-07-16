import { z } from 'zod'

/**
 * Contrat d'input de la server action : l'identifiant de la structure employeuse
 * et le choix Oui/Non. L'utilisateur vient de l'authentification, pas de l'input.
 */
export const StructureEmployeuseLieuValidation = z.object({
  structureEmployeuseId: z.string().uuid(),
  estLieuActivite: z.boolean(),
})

export type StructureEmployeuseLieuData = z.infer<
  typeof StructureEmployeuseLieuValidation
>
