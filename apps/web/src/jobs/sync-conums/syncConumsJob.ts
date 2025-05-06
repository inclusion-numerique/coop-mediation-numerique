import z from 'zod'

export const SyncConumsJobValidation = z.object({
  name: z.literal('sync-conums'),
  payload: z.object({}).optional(),
})

export type SyncConumsJob = z.infer<typeof SyncConumsJobValidation>
