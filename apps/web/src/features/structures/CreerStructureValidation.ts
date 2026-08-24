import z from 'zod'
import { auMoinsUnServiceSiVisible, CreerLieuShape } from './CreerLieuShape'

export const CreerStructureValidation = z
  .object({
    // Créer un lieu d’activité pour un médiateur en meme temps que la structure
    lieuActiviteMediateurId: z.string().nullish(),
    ...CreerLieuShape,
  })
  .refine(...auMoinsUnServiceSiVisible)

export type CreerStructureData = z.infer<typeof CreerStructureValidation>
