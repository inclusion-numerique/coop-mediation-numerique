import { z } from 'zod'
import { MessageDeMaintenance } from '@/features/maintenance-mode/domain'

export const ReglerLaMaintenanceValidation = z.discriminatedUnion('_tag', [
  z.object({
    _tag: z.literal('Activer'),
    message: MessageDeMaintenance.schema.nullable(),
  }),
  z.object({ _tag: z.literal('Desactiver') }),
])
