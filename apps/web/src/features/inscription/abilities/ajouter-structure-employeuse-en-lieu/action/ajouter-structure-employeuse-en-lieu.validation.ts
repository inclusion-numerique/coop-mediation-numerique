import { z } from 'zod'

/**
 * Contrat d'input de la server action : le seul choix Oui/Non.
 *
 * Ni l'utilisateur ni son employeuse ne viennent de l'input — le premier de
 * l'authentification, la seconde de la lecture serveur qui en découle. L'écran
 * affiche l'employeuse, il ne la désigne pas : la lui faire renvoyer
 * reviendrait à laisser le client choisir la structure à matérialiser.
 */
export const StructureEmployeuseLieuValidation = z.object({
  estLieuActivite: z.boolean(),
})

export type StructureEmployeuseLieuData = z.infer<
  typeof StructureEmployeuseLieuValidation
>
