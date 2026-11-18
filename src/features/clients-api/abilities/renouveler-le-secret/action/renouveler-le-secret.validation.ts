import { z } from 'zod'

export const RenouvelerLeSecretValidation = z.object({ clientApiId: z.guid() })
