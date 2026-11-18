import { z } from 'zod'
import { PerimetrePartage } from '@/features/mediateurs/domain'

export const ReglerLePartageStatistiquesValidation = z.object({
  actif: z.boolean(),
  perimetre: PerimetrePartage.schema,
})
