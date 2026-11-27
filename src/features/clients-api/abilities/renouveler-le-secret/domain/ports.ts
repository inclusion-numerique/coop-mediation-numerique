import type {
  ClientApiExiste,
  ClientApiId,
  GenererUnSecret,
} from '@/features/clients-api/domain'

export type EnregistrerLeSecret = (renouvellement: {
  readonly id: ClientApiId
  readonly secretHash: string
  readonly maintenant: Date
}) => Promise<void>

export type RenouvelerLeSecretPorts = {
  readonly clientApiExiste: ClientApiExiste
  readonly genererUnSecret: GenererUnSecret
  readonly enregistrer: EnregistrerLeSecret
}
