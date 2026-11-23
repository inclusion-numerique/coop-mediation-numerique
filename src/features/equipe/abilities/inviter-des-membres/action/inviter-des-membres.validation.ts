import { z } from 'zod'

export const InviterDesMembresValidation = z.object({
  emails: z
    .array(z.email())
    .min(1)
    .max(50, 'Vous pouvez inviter au plus 50 personnes à la fois'),
})
