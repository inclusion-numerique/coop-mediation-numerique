import z from 'zod'

export const AuditStructuresOverviewJobValidation = z.object({
  name: z.literal('audit-structures-overview'),
  payload: z.object({}).optional(),
})

export type AuditStructuresOverviewJob = z.infer<
  typeof AuditStructuresOverviewJobValidation
>
