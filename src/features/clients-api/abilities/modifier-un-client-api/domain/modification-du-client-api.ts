import type {
  ClientApiId,
  DefinitionDuClientApi,
} from '@/features/clients-api/domain'

export type ModificationDuClientApi = {
  readonly id: ClientApiId
  readonly definition: DefinitionDuClientApi
  readonly maintenant: Date
}
