import z from 'zod'

export const DataspaceSearchValidation = z.object({
  email: z
    .string({
      required_error: 'Veuillez renseigner un email',
    })
    .email('Veuillez renseigner un email valide'),
})

export type DataspaceSearchData = z.infer<typeof DataspaceSearchValidation>
