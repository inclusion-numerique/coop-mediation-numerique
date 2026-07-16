import { StructureValidation } from '@app/web/features/structures/StructureValidation'
import { z } from 'zod'

/**
 * Contrat d'input de la server action : la liste des lieux d'activité désirés
 * (au moins un). L'utilisateur vient de l'authentification, pas de l'input ; le
 * champ d'aide de recherche du formulaire n'a pas sa place ici.
 */
export const RenseignerLieuxActiviteValidation = z.object({
  lieuxActivite: z
    .array(StructureValidation, {
      required_error: 'Veuillez renseigner au moins un lieu d’activité',
    })
    .min(1, 'Veuillez renseigner au moins un lieu d’activité'),
})

export type RenseignerLieuxActiviteData = z.infer<
  typeof RenseignerLieuxActiviteValidation
>
