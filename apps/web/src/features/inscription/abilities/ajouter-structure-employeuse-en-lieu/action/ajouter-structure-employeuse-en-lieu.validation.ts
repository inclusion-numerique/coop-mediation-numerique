import { z } from 'zod'

/**
 * Contrat d'input de la server action : l'identifiant de l'employeuse et le
 * choix Oui/Non. L'utilisateur vient de l'authentification, pas de l'input.
 *
 * L'identifiant est l'entier `main.structure_administrative.id` — c'est ce que
 * l'écran reçoit depuis la lecture employeuse, et non un uuid coop.
 */
export const StructureEmployeuseLieuValidation = z.object({
  structureEmployeuseId: z.number().int().positive(),
  estLieuActivite: z.boolean(),
})

export type StructureEmployeuseLieuData = z.infer<
  typeof StructureEmployeuseLieuValidation
>
