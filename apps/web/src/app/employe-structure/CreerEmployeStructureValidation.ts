import { StructureCreationValidationWithSiret } from '@app/web/features/structures/StructureValidation'
import z from 'zod'

export const CreerEmployeStructureValidation = z.object({
  userId: z
    .string({
      required_error: 'Veuillez sélectionner un utilisateur',
    })
    .uuid(),
  structureEmployeuse: StructureCreationValidationWithSiret,
  debut: z
    .string({
      required_error: 'Veuillez renseigner une date de début du contrat',
    })
    .date('Veuillez renseigner une date valide'),
  fin: z.string().nullish(),
})

export type CreerEmployeStructureData = z.infer<
  typeof CreerEmployeStructureValidation
>
