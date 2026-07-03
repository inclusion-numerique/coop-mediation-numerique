import z from 'zod'

export const AuditLieuxOverviewJobValidation = z.object({
  name: z.literal('audit-lieux-overview'),
  payload: z.object({}).optional(),
})

export type AuditStructuresOverviewJob = z.infer<
  typeof AuditLieuxOverviewJobValidation
>
