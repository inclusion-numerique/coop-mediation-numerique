import { z } from 'zod'

export const NOM_DU_TAG_LONGUEUR_MIN = 3
export const NOM_DU_TAG_LONGUEUR_MAX = 80
export const DESCRIPTION_DU_TAG_LONGUEUR_MAX = 280

export const SaisieDuTag = z.object({
  nom: z
    .string()
    .trim()
    .min(
      NOM_DU_TAG_LONGUEUR_MIN,
      `Le nom du tag doit faire plus de ${NOM_DU_TAG_LONGUEUR_MIN} caractères`,
    )
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
