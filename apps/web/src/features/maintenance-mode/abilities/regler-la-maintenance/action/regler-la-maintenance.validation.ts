import { MessageDeMaintenance } from '@app/web/features/maintenance-mode/domain'
import { z } from 'zod'

export const ReglerLaMaintenanceValidation = z.discriminatedUnion('_tag', [
  z.object({
    _tag: z.literal('Activer'),
    message: MessageDeMaintenance.schema.nullable(),
  }),
  z.object({ _tag: z.literal('Desactiver') }),
])
