import { z } from 'zod'
import {
  DESCRIPTION_DU_TAG_LONGUEUR_MAX,
  NOM_DU_TAG_LONGUEUR_MAX,
} from '../../../domain'

export const ModifierUnTagValidation = z.object({
  tagId: z.guid(),
  nom: z
    .string()
    .trim()
    .min(3, 'Le nom du tag doit faire plus de 3 caractères')
    .max(
      NOM_DU_TAG_LONGUEUR_MAX,
      `Le nom du tag doit faire moins de ${NOM_DU_TAG_LONGUEUR_MAX} caractères`,
    ),
  description: z
    .string()
    .max(
      DESCRIPTION_DU_TAG_LONGUEUR_MAX,
      `La description du tag doit faire moins de ${DESCRIPTION_DU_TAG_LONGUEUR_MAX} caractères`,
    )
    .nullable(),
})
