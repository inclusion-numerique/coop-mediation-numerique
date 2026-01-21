import z from 'zod'

export const SyncUsersFromDataspaceJobValidation = z.object({
  name: z.literal('sync-users-from-dataspace'),
  payload: z.object({}).optional(),
})

export type SyncUsersFromDataspaceJob = z.infer<
  typeof SyncUsersFromDataspaceJobValidation
>
