import { PerimetrePartage } from '@app/web/features/mediateurs/domain'
import { z } from 'zod'

export const ReglerLePartageStatistiquesValidation = z.object({
  actif: z.boolean(),
  perimetre: PerimetrePartage.schema,
})
