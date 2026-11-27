import { z } from 'zod'
import { ClientApiId } from '@/features/clients-api/domain'

export const RenouvelerLeSecretValidation = z.object({
  clientApiId: ClientApiId.schema,
})
