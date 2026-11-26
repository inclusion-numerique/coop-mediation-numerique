import {
  champsDuClientApi,
  periodeCoherente,
} from '@/features/clients-api/action/client-api.validation'
import { ClientApiId } from '@/features/clients-api/domain'

export const ModifierUnClientApiValidation = champsDuClientApi
  .extend({ clientApiId: ClientApiId.schema })
  .refine(periodeCoherente.verifier, periodeCoherente.erreur)
