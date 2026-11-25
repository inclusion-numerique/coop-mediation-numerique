import { z } from 'zod'

export const ContactDeLaLigne = z
  .object({
    telephone: z.string().nullish().catch(null),
    courriels: z
      .object({ email: z.string().nullish().catch(null) })
      .nullish()
      .catch(null),
    site_web: z.string().nullish().catch(null),
  })
  .catch({ telephone: null, courriels: null, site_web: null })
