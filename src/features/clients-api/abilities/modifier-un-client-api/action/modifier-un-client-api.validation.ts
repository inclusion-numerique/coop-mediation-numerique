import { z } from 'zod'
import {
  champsDuClientApi,
  periodeCoherente,
} from '@/features/clients-api/action/client-api.validation'

export const ModifierUnClientApiValidation = champsDuClientApi
  .extend({ clientApiId: z.guid() })
  .refine(periodeCoherente.verifier, periodeCoherente.erreur)
