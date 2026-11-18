import { z } from 'zod'

export const AppliquerLesDifferencesValidation = z.object({
  id: z.guid(),
  choix: z.record(z.string(), z.enum(['coop', 'registre'])),
})
