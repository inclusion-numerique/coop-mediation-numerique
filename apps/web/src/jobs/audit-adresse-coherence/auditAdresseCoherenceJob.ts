import z from 'zod'

export const AuditAdresseCoherenceJobValidation = z.object({
  name: z.literal('audit-adresse-coherence'),
  payload: z
    .object({
      limit: z.number().optional(),
    })
    .optional(),
})

export type AuditAdresseCoherenceJob = z.infer<
  typeof AuditAdresseCoherenceJobValidation
>
