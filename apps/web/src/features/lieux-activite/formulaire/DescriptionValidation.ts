import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import z from 'zod'

export const descriptionMaxLength = 280

export const DescriptionShape = {
  presentationResume: z
    .string()
    .max(
      descriptionMaxLength,
      `Cette description doit faire moins de ${descriptionMaxLength} caractères`,
    )
    .trim()
    .nullish(),
  presentationDetail: z.string().trim().nullish(),
  formationsLabels: z
    .array(z.enum(vocabulaire.formationLabel.valeurs))
    .nullish(),
}

export const DescriptionValidation = z.object({
  id: z.string().uuid(),
  ...DescriptionShape,
})

export type DescriptionData = z.infer<typeof DescriptionValidation>
