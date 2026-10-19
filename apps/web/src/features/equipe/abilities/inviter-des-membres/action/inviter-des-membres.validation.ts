import { z } from 'zod'

export const InviterDesMembresValidation = z.object({
  emails: z.array(z.email()).min(1),
})
