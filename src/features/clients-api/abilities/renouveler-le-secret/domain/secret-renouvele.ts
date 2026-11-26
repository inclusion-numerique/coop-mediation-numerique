import type { ClientApiId } from '@/features/clients-api/domain'

export type SecretRenouvele = {
  readonly clientApiId: ClientApiId
  readonly secret: string
  readonly secretHash: string
  readonly maintenant: Date
}
