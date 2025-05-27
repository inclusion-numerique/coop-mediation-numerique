import z from 'zod'

export const nomMaxLength = 80
export const descriptionMaxLength = 280

export enum TagScope {
  Personnel = 'personnel',
  Departemental = 'départemental',
}

export const TagValidation = z.object({
  nom: z
    .string()
    .min(3, `Le nom du tag doit faire plus de 3 caractères`)
    .max(
      nomMaxLength,
      `Le nom du tag doit faire moins de ${nomMaxLength} caractères`,
    ),
  scope: z.enum([TagScope.Personnel, TagScope.Departemental]).nullish(),
  description: z
    .string()
    .max(
      descriptionMaxLength,
      `La description du tag doit faire moins de ${descriptionMaxLength} caractères`,
    )
    .nullish(),
})
