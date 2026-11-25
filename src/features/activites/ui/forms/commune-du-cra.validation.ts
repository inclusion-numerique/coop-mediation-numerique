import z from 'zod'

export const CommuneDuCraValidation = z.object(
  {
    id: z.string(),
    label: z.string(),
    commune: z.string(),
    codePostal: z.string(),
    codeInsee: z.string(),
  },
  { error: 'Veuillez renseigner une commune' },
)

export type CommuneDuCra = z.infer<typeof CommuneDuCraValidation>
