import {
  type ClientApiId,
  ClientApiIntrouvable,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeRenouvelerLeSecret } from './errors'
import type { RenouvelerLeSecretPorts } from './ports'
import type { SecretRenouvele } from './secret-renouvele'

export const renouvelerLeSecret =
  ({
    clientApiExiste,
    genererUnSecret,
    enregistrer,
  }: RenouvelerLeSecretPorts) =>
  async ({
    clientApiId,
  }: {
    readonly clientApiId: ClientApiId | null
  }): Promise<Result<SecretRenouvele, EchecDeRenouvelerLeSecret>> => {
    if (clientApiId === null || !(await clientApiExiste(clientApiId)))
      return failure(ClientApiIntrouvable())

    const { secret, secretHash } = genererUnSecret()
    await enregistrer({ id: clientApiId, secretHash })

    return success({ clientApiId, secret, secretHash })
  }
