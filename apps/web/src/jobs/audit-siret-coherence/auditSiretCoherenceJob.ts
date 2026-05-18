import z from 'zod'

export const AuditSiretCoherenceJobValidation = z.object({
  name: z.literal('audit-siret-coherence'),
  payload: z
    .object({
      limit: z.number().optional(),
    })
    .optional(),
})

export type AuditSiretCoherenceJob = z.infer<
  typeof AuditSiretCoherenceJobValidation
>
