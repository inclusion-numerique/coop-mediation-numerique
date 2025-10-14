import z from 'zod'

export const SyncRdvspDataJobValidation = z.object({
  name: z.literal('sync-rdvsp-data'),
  payload: z.object({}).optional(),
})

export type SyncRdvspDataJob = z.infer<typeof SyncRdvspDataJobValidation>
