import { z } from 'zod'

export const MaintenanceModeValidation = z.object({
  active: z.boolean(),
  message: z.string().trim().min(1).max(500).nullish(),
})

export type MaintenanceModeData = z.infer<typeof MaintenanceModeValidation>
