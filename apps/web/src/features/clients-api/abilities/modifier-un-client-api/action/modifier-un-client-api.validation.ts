import {
  champsDuClientApi,
  periodeCoherente,
} from '@app/web/features/clients-api/formulaire'
import { z } from 'zod'

export const ModifierUnClientApiValidation = champsDuClientApi
  .extend({ clientApiId: z.guid() })
  .refine(periodeCoherente.verifier, periodeCoherente.erreur)
