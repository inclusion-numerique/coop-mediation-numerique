import { z } from 'zod'

/**
 * Le choix du médiateur, un champ à la fois.
 *
 * Les clés ne sont pas contraintes à la liste des champs comparés : celles
 * qu'elle ne connaît pas seront ignorées à l'application, qui ne regarde que les
 * différences réellement constatées en base. Un client malveillant ne peut donc
 * rien écrire par ce chemin qui ne soit déjà l'une des deux valeurs en présence.
 */
export const AppliquerLesDifferencesValidation = z.object({
  id: z.string().uuid(),
  choix: z.record(z.string(), z.enum(['coop', 'registre'])),
})

export type AppliquerLesDifferencesData = z.infer<
  typeof AppliquerLesDifferencesValidation
>
