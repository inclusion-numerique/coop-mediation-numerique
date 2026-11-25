import { z } from 'zod'

export const NOM_LONGUEUR_MAX = 80
export const DESCRIPTION_LONGUEUR_MAX = 280

export const CreationDeTagValidation = z.object({
  nom: z
    .string()
    .trim()
    .min(3, 'Le nom du tag doit faire plus de 3 caractères')
    .max(
      NOM_LONGUEUR_MAX,
      `Le nom du tag doit faire moins de ${NOM_LONGUEUR_MAX} caractères`,
    ),
  description: z
    .string()
    .max(
      DESCRIPTION_LONGUEUR_MAX,
      `La description du tag doit faire moins de ${DESCRIPTION_LONGUEUR_MAX} caractères`,
    )
    .nullable(),
  visibilite: z.discriminatedUnion('_tag', [
    z.object({ _tag: z.literal('Personnel') }),
    z.object({ _tag: z.literal('Equipe'), coordinateurId: z.guid() }),
    z.object({ _tag: z.literal('Departemental') }),
  ]),
})

export type ValeursDeCreationDeTag = z.input<typeof CreationDeTagValidation>
