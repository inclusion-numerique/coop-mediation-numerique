import z from 'zod'
import { formationLabelValues } from './formationLabel'

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
  formationsLabels: z.array(z.enum(formationLabelValues)).nullish(),
}

export const DescriptionValidation = z.object({
  id: z.string().uuid(),
  ...DescriptionShape,
})

export type DescriptionData = z.infer<typeof DescriptionValidation>
