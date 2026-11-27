import type { ClientApi } from '@/features/clients-api/domain'

export type ClientApiCree = {
  readonly client: ClientApi
  readonly secret: string
  readonly secretHash: string
}
